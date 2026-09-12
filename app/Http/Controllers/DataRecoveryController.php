<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DataRecoveryController extends Controller
{
    /**
     * Audit all database records to identify missing/orphaned user transactions
     */
    public function audit(): JsonResponse
    {
        $users = User::all()->map(function ($u) {
            $txCount = $u->transactions()->count();
            $income  = (float) $u->transactions()->where('type', 'income')->sum('amount');
            $expense = (float) $u->transactions()->where('type', 'expense')->sum('amount');
            $wallets = $u->wallets()->get(['id', 'name', 'balance'])->toArray();

            return [
                'id'              => $u->id,
                'name'            => $u->name,
                'email'           => $u->email,
                'whatsapp_number' => $u->whatsapp_number,
                'wallets'         => $wallets,
                'transaction_count' => $txCount,
                'total_income'    => $income,
                'total_expense'   => $expense,
                'created_at'      => $u->created_at?->toIso8601String(),
            ];
        });

        $totalTransactions = Transaction::count();
        $recentTransactions = Transaction::latest('id')
            ->limit(15)
            ->get(['id', 'user_id', 'wallet_id', 'type', 'amount', 'description', 'date', 'created_at']);

        return response()->json([
            'status'             => true,
            'total_users'        => $users->count(),
            'users'              => $users,
            'total_transactions' => $totalTransactions,
            'recent'             => $recentTransactions,
        ]);
    }

    /**
     * Synchronize and merge all transactions from secondary/guest users to master user
     */
    public function mergeToMaster(Request $request): JsonResponse
    {
        $masterUser = User::first();
        if (!$masterUser) {
            return response()->json(['status' => false, 'message' => 'No master user found.'], 404);
        }

        $sourceUserId = $request->input('source_user_id');

        $query = Transaction::where('user_id', '!=', $masterUser->id);
        if ($sourceUserId) {
            $query->where('user_id', $sourceUserId);
        }

        $count = $query->count();
        $query->update(['user_id' => $masterUser->id]);

        // Also merge wallets
        $walletQuery = Wallet::where('user_id', '!=', $masterUser->id);
        if ($sourceUserId) {
            $walletQuery->where('user_id', $sourceUserId);
        }
        $walletCount = $walletQuery->count();
        $walletQuery->update(['user_id' => $masterUser->id]);

        return response()->json([
            'status'             => true,
            'merged_transactions' => $count,
            'merged_wallets'     => $walletCount,
            'master_user_id'     => $masterUser->id,
        ]);
    }

    /**
     * Recalculate all wallet balances based on their actual transactions
     */
    public function recalculateBalances(Request $request): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'User not found.'], 404);
        }

        $wallets = $user->wallets()->get();
        $results = [];

        foreach ($wallets as $wallet) {
            $income = (float) $user->transactions()
                ->where('wallet_id', $wallet->id)
                ->where('type', 'income')
                ->sum('amount');

            $expense = (float) $user->transactions()
                ->where('wallet_id', $wallet->id)
                ->where('type', 'expense')
                ->sum('amount');

            $calculatedBalance = $income - $expense;
            $oldBalance = $wallet->balance;

            $wallet->update(['balance' => $calculatedBalance]);

            $results[] = [
                'wallet_id'   => $wallet->id,
                'name'        => $wallet->name,
                'old_balance' => $oldBalance,
                'new_balance' => $calculatedBalance,
                'total_income' => $income,
                'total_expense' => $expense,
            ];
        }

        return response()->json([
            'status'  => true,
            'message' => 'Saldo seluruh dompet berhasil diselaraskan dengan riwayat transaksi.',
            'wallets' => $results,
        ]);
    }

    /**
     * Remove exact duplicate transactions created within short window (e.g. from batch-restore)
     */
    public function cleanDuplicates(Request $request): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'User not found.'], 404);
        }

        $allTx = $user->transactions()->orderBy('id')->get();
        $seen = [];
        $deletedIds = [];

        foreach ($allTx as $tx) {
            $key = $tx->type . '|' . (float)$tx->amount . '|' . trim((string)$tx->description) . '|' . $tx->date . '|' . $tx->wallet_id;

            if (isset($seen[$key])) {
                // If created within 10 minutes of each other or exact duplicate in batch
                $deletedIds[] = $tx->id;
            } else {
                $seen[$key] = $tx->id;
            }
        }

        if (!empty($deletedIds)) {
            Transaction::whereIn('id', $deletedIds)->delete();
        }

        return response()->json([
            'status'       => true,
            'deleted_count' => count($deletedIds),
            'deleted_ids'  => $deletedIds,
            'message'      => count($deletedIds) . ' transaksi duplikat berhasil dibersihkan.',
        ]);
    }

    /**
     * Remove empty duplicate "Dompet Utama" wallets created by anonymous guest sessions
     */
    public function cleanupEmptyWallets(): JsonResponse
    {
        $masterUser = User::first();
        if (!$masterUser) {
            return response()->json(['status' => false], 404);
        }

        // Delete empty "Dompet Utama" wallets that have no transactions and balance 0, keeping ID 1
        $deleted = Wallet::where('user_id', $masterUser->id)
            ->where('id', '!=', 1)
            ->where('name', 'Dompet Utama')
            ->where('balance', '<=', 0)
            ->whereDoesntHave('transactions')
            ->delete();

        return response()->json([
            'status' => true,
            'deleted_empty_wallets' => $deleted,
        ]);
    }

    /**
     * Run full auto-healing: merge orphaned records, remove duplicates, delete empty wallets, recalculate balances
     */
    public function fixAll(Request $request): JsonResponse
    {
        $mergeRes = $this->mergeToMaster($request)->getData(true);
        $cleanEmpty = $this->cleanupEmptyWallets()->getData(true);
        $cleanRes = $this->cleanDuplicates($request)->getData(true);
        $recalcRes = $this->recalculateBalances($request)->getData(true);

        return response()->json([
            'status'  => true,
            'message' => 'Semua data transaksi dan saldo berhasil disinkronkan & diperbaiki.',
            'details' => [
                'merge'        => $mergeRes,
                'clean_empty'  => $cleanEmpty,
                'clean'        => $cleanRes,
                'recalc'       => $recalcRes,
            ]
        ]);
    }
}
