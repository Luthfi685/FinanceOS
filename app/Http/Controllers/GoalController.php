<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\Transaction;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $now = Carbon::now();

        $goals = $user->goals()
            ->latest()
            ->get()
            ->map(function ($g) {
                $daysLeft = $g->days_remaining_by_daily;
                $monthsLeft = $daysLeft ? round($daysLeft / 30, 1) : null;

                return [
                    'id'                        => $g->id,
                    'name'                      => $g->name,
                    'target_amount'             => (float) $g->target_amount,
                    'daily_target'              => $g->daily_target ? (float) $g->daily_target : null,
                    'current_amount'            => (float) $g->current_amount,
                    'remaining'                 => $g->remaining,
                    'percentage'                => $g->percentage,
                    'target_date'               => $g->target_date ? $g->target_date->format('Y-m-d') : null,
                    'last_deposit_at'           => $g->last_deposit_at ? $g->last_deposit_at->format('Y-m-d') : null,
                    'streak_count'              => (int) $g->streak_count,
                    'is_deposited_today'        => $g->is_deposited_today,
                    'missed_days'               => $g->missed_days,
                    'missed_amount'             => $g->daily_target ? $g->missed_days * (float)$g->daily_target : 0,
                    'days_remaining_by_daily'   => $daysLeft,
                    'months_remaining_by_daily' => $monthsLeft,
                    'estimated_completion_date' => $g->estimated_completion_date,
                    'icon'                      => $g->icon ?? '🎯',
                    'color'                     => $g->color ?? '#2563EB',
                    'is_completed'              => $g->is_completed,
                    'status'                    => $g->status,
                ];
            });

        $wallets = $user->wallets()->get(['id', 'name', 'balance', 'type']);
        $monthlySavings = max(0, $user->getMonthlyIncome($now->month, $now->year) - $user->getMonthlyExpense($now->month, $now->year));

        return Inertia::render('Goals/Index', [
            'goals'          => $goals,
            'wallets'        => $wallets,
            'monthlySavings' => $monthlySavings,
            'totalSaved'     => (float) $goals->sum('current_amount'),
            'totalTarget'    => (float) $goals->sum('target_amount'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:100',
            'target_amount'  => 'required|numeric|min:1000',
            'daily_target'   => 'nullable|numeric|min:1000',
            'current_amount' => 'nullable|numeric|min:0',
            'target_date'    => 'nullable|date',
            'icon'           => 'nullable|string|max:10',
            'color'          => 'nullable|string|max:20',
        ]);

        Auth::user()->goals()->create($validated);

        return back()->with('success', 'Target tabungan impian berhasil dibuat!');
    }

    /**
     * Deposit funds from a wallet directly into a goal
     */
    public function deposit(Request $request, Goal $goal): RedirectResponse
    {
        $validated = $request->validate([
            'wallet_id' => 'required|exists:wallets,id',
            'amount'    => 'required|numeric|min:1000',
        ]);

        $user = Auth::user();
        $wallet = $user->wallets()->findOrFail($validated['wallet_id']);
        $amount = (float) $validated['amount'];

        if ($wallet->balance < $amount) {
            return back()->with('error', "Saldo dompet {$wallet->name} tidak mencukupi (Rp " . number_format($wallet->balance, 0, ',', '.') . ").");
        }

        DB::beginTransaction();
        try {
            // Deduct from wallet
            $wallet->decrement('balance', $amount);

            // Streak calculation
            $today = Carbon::now()->startOfDay();
            $lastDeposit = $goal->last_deposit_at ? Carbon::parse($goal->last_deposit_at)->startOfDay() : null;

            $newStreak = $goal->streak_count;
            if (!$lastDeposit) {
                $newStreak = 1;
            } elseif ($lastDeposit->isYesterday()) {
                $newStreak += 1;
            } elseif (!$lastDeposit->isToday()) {
                $newStreak = 1; // reset streak if missed a day
            }

            // Add to goal
            $goal->increment('current_amount', $amount);
            $goal->refresh(); // Get fresh value from DB after increment

            $goal->update([
                'last_deposit_at' => $today->toDateString(),
                'streak_count'    => $newStreak,
                'status'          => ($goal->current_amount >= $goal->target_amount) ? 'completed' : 'active',
            ]);

            // Log as transaction
            Transaction::create([
                'user_id'         => $user->id,
                'wallet_id'       => $wallet->id,
                'category_id'     => null,
                'type'            => 'expense',
                'amount'          => $amount,
                'merchant_name'   => "Setor Target: {$goal->name}",
                'description'     => "Alokasi tabungan untuk target '{$goal->name}'",
                'date'            => now()->toDateString(),
                'currency'        => $wallet->currency ?? 'IDR',
                'is_ai_generated' => false,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memproses setoran target: ' . $e->getMessage());
        }

        return back()->with('success', "Berhasil menyetor Rp " . number_format($amount, 0, ',', '.') . " ke target '{$goal->name}'!");
    }

    public function update(Request $request, Goal $goal): RedirectResponse
    {
        if ($goal->user_id !== Auth::id()) abort(403);

        $validated = $request->validate([
            'name'           => 'required|string|max:100',
            'target_amount'  => 'required|numeric|min:1000',
            'daily_target'   => 'nullable|numeric|min:1000',
            'current_amount' => 'nullable|numeric|min:0',
            'target_date'    => 'nullable|date',
            'icon'           => 'nullable|string|max:10',
            'color'          => 'nullable|string|max:20',
        ]);

        $goal->update($validated);

        return back()->with('success', 'Target tabungan diperbarui.');
    }

    public function destroy(Goal $goal): RedirectResponse
    {
        if ($goal->user_id !== Auth::id()) abort(403);

        $goal->delete();

        return back()->with('success', 'Target tabungan berhasil dihapus.');
    }
}
