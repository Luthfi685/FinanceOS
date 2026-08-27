<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Http\Requests\WalletRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(): Response
    {
        $wallets = Auth::user()
            ->wallets()
            ->withCount('transactions')
            ->withSum(['transactions as total_income' => fn($q) => $q->where('type', 'income')], 'amount')
            ->withSum(['transactions as total_expense' => fn($q) => $q->where('type', 'expense')], 'amount')
            ->latest()
            ->get();

        return Inertia::render('Wallets/Index', [
            'wallets' => $wallets,
        ]);
    }

    public function store(WalletRequest $request): RedirectResponse
    {
        Auth::user()->wallets()->create($request->validated());

        return back()->with('success', 'Wallet berhasil ditambahkan.');
    }

    public function update(WalletRequest $request, Wallet $wallet): RedirectResponse
    {
        $this->authorize('update', $wallet);

        $wallet->update($request->validated());

        return back()->with('success', 'Wallet berhasil diperbarui.');
    }

    public function destroy(Wallet $wallet): RedirectResponse
    {
        $this->authorize('delete', $wallet);

        if ($wallet->transactions()->exists()) {
            return back()->with('error', 'Wallet tidak bisa dihapus karena masih memiliki transaksi.');
        }

        $wallet->delete();

        return back()->with('success', 'Wallet berhasil dihapus.');
    }
}
