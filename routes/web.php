<?php

use App\Http\Controllers\AiAdvisorController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReceiptScannerController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\AchievementsController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Auth Routes (Breeze) ─────────────────────────────────────────────────────
require __DIR__.'/auth.php';

// ─── Authenticated Routes ─────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.alt');

    // AI & Vision Engine
    Route::post('/ai/analyze', [AiAdvisorController::class, 'analyze'])->name('ai.analyze');
    Route::post('/ai/parse-transaction', [AiAdvisorController::class, 'parseTransaction'])->name('ai.parse-transaction');
    Route::post('/ai/batch-restore', [AiAdvisorController::class, 'batchRestore'])->name('ai.batch-restore');
    Route::post('/ai/scan-receipt', [ReceiptScannerController::class, 'scan'])->name('receipt.scan');

    // Reports & Exports
    Route::get('/reports/export-csv', [ReportController::class, 'exportCsv'])->name('reports.export-csv');
    Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.export-pdf');

    // Wallets
    Route::resource('wallets', WalletController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Transactions
    Route::resource('transactions', TransactionController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Categories
    Route::resource('categories', CategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Budgets
    Route::resource('budgets', BudgetController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Financial Goals & Savings Buckets
    Route::resource('goals', GoalController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::post('/goals/{goal}/deposit', [GoalController::class, 'deposit'])->name('goals.deposit');

    // Achievements & Badges
    Route::get('/achievements', [AchievementsController::class, 'index'])->name('achievements');

    // Split Bill (pure frontend page — no backend needed)
    Route::get('/split-bill', fn() => Inertia::render('SplitBill/Index'))->name('split-bill');

    // Profile (Breeze default)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
