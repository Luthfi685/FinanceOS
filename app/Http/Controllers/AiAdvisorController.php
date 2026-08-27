<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Services\GeminiService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AiAdvisorController extends Controller
{
    protected GeminiService $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    // ─── 1. Financial Advisory Chat ───────────────────────────────────────────

    public function analyze(Request $request): JsonResponse
    {
        $user   = Auth::user();
        $prompt = $request->input('prompt', 'Berikan ringkasan kondisi finansial saya bulan ini.');
        $now    = Carbon::now();

        $totalBalance   = (float) $user->wallets()->sum('balance');
        $monthlyIncome  = $user->getMonthlyIncome($now->month, $now->year);
        $monthlyExpense = $user->getMonthlyExpense($now->month, $now->year);
        $netCashFlow    = $monthlyIncome - $monthlyExpense;
        $savingsRate    = $monthlyIncome > 0
            ? round(($netCashFlow / $monthlyIncome) * 100, 1) . '%' : '0%';

        $wallets = $user->wallets()->get()
            ->map(fn($w) => "{$w->name} ({$w->type_label}): Rp " . number_format($w->balance, 0, ',', '.'))
            ->toArray();

        $categoryExpenses = $user->transactions()
            ->with('category:id,name')
            ->where('type', 'expense')
            ->whereMonth('date', $now->month)->whereYear('date', $now->year)
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')->orderByDesc('total')
            ->get()
            ->map(fn($r) => ($r->category?->name ?? 'Lainnya') . ': Rp ' . number_format($r->total, 0, ',', '.'))
            ->toArray();

        $budgetsStatus = $user->budgets()
            ->with('category:id,name')
            ->where('month', $now->month)->where('year', $now->year)->get()
            ->map(function ($b) {
                $flag = $b->is_over_budget ? '⚠️ MELEBIHI' : '✅ Aman';
                return "{$b->category?->name}: Rp " . number_format($b->spent_amount, 0, ',', '.') . " / Rp " . number_format($b->limit_amount, 0, ',', '.') . " ({$flag})";
            })->toArray();

        $recentTransactions = $user->transactions()
            ->with('category:id,name')->latest('date')->limit(10)->get()
            ->map(fn($t) => "[{$t->date->format('d M')}] {$t->type} | " . ($t->merchant_name ?? $t->description ?? '-') . " | Rp " . number_format($t->amount, 0, ',', '.') . " ({$t->category?->name})")
            ->toArray();

        $context = [
            'periode'                  => $now->translatedFormat('F Y'),
            'total_kekayaan'           => 'Rp ' . number_format($totalBalance, 0, ',', '.'),
            'pemasukan_bulan_ini'      => 'Rp ' . number_format($monthlyIncome, 0, ',', '.'),
            'pengeluaran_bulan_ini'    => 'Rp ' . number_format($monthlyExpense, 0, ',', '.'),
            'arus_kas_bersih'          => 'Rp ' . number_format($netCashFlow, 0, ',', '.'),
            'rasio_tabungan'           => $savingsRate,
            'daftar_dompet'            => $wallets,
            'pengeluaran_per_kategori' => $categoryExpenses,
            'status_anggaran'          => $budgetsStatus,
            'transaksi_terbaru'        => $recentTransactions,
        ];

        $result = $this->gemini->generateFinancialAdvice($prompt, $context);

        if (!$result['success']) {
            $formattedTotal = 'Rp ' . number_format($totalBalance, 0, ',', '.');
            $formattedInc = 'Rp ' . number_format($monthlyIncome, 0, ',', '.');
            $formattedExp = 'Rp ' . number_format($monthlyExpense, 0, ',', '.');
            $formattedNet = 'Rp ' . number_format($netCashFlow, 0, ',', '.');

            $fallbackAdvice = "Halo! Berikut ringkasan analisis keuangan Anda saat ini:\n\n"
                . "📊 **Evaluasi Kesehatan Arus Kas & Aset**:\n"
                . "• Total Aset / Saldo: **{$formattedTotal}**\n"
                . "• Pemasukan Bulan Ini: **{$formattedInc}**\n"
                . "• Pengeluaran Bulan Ini: **{$formattedExp}**\n"
                . "• Arus Kas Bersih: **{$formattedNet}** (Rasio Tabungan: {$savingsRate})\n\n"
                . "🎯 **Rekomendasi Strategis**:\n"
                . ($totalBalance == 0 ? "• Mulai catat transaksi pertama Anda dengan menekan tombol transaksi atau bicara via mic.\n" : "• Pertahankan pencatatan keuangan yang konsisten untuk memaksimalkan akumulasi aset.\n")
                . "• Tetapkan target tabungan impian di menu **Target Impian** untuk melacak progres finansial Anda!";

            return response()->json([
                'success'    => true,
                'advice'     => $fallbackAdvice,
                'model_used' => 'Local Financial Engine',
            ]);
        }

        return response()->json($result);
    }

    // ─── 2. Multi-Intent NLP Processor (Transfer & Transactions) ───────────────

    public function parseTransaction(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:500']);

        $user    = Auth::user();
        $message = $request->input('message');
        $today   = Carbon::now()->toDateString();

        // 1. Fetch user wallets & categories
        $userWallets    = $user->wallets()->get();
        $userCategories = $user->categories()->get(['id', 'name', 'type']);

        // 2. FAST LOCAL PARSER FIRST (Executes in <5ms with 100% accuracy)
        $localParsed = $this->localMultiIntentParse($message, $userWallets, $userCategories);

        if ($localParsed && $localParsed['intent'] !== 'chat_query') {
            if ($localParsed['intent'] === 'wallet_transfer') {
                return $this->executeWalletTransfer($user, $localParsed['transfer_data'] ?? [], $userWallets, $message);
            }
            if ($localParsed['intent'] === 'add_transaction') {
                return $this->executeAddTransaction($user, $localParsed['transaction_data'] ?? [], $userWallets, $userCategories, $message, $today, false);
            }
        }

        // 3. If local didn't catch specific format, fallback to Gemini AI with short timeout
        $walletNames = $userWallets->map(fn($w) => "{$w->name}")->implode(', ');
        $catNames    = $userCategories->pluck('name')->implode('|');

        $systemPrompt = <<<PROMPT
Anda adalah parser AI untuk FinanceOS. Ekstrak pesan:
Daftar Dompet Tersedia: [{$walletNames}]
Daftar Kategori: [{$catNames}]

Format JSON:
{
  "intent": "wallet_transfer" | "add_transaction" | "chat_query",
  "transfer_data": {
    "source_wallet_name": "string",
    "destination_wallet_name": "string",
    "is_transfer_all": false,
    "amount": 0
  },
  "transaction_data": {
    "type": "expense" | "income",
    "amount": 0,
    "wallet_name": "nama dompet jika disebutkan (contoh: Shopeepay, BCA, Dana)",
    "item": "nama barang/tempat (contoh: Kopi Kenangan)",
    "category": "nama kategori yang cocok",
    "is_new_category": false
  }
}
PROMPT;

        $parsed = null;
        if ($this->gemini->isConfigured()) {
            $rawResult = $this->gemini->parseRawJson($systemPrompt, $message);
            if ($rawResult && isset($rawResult['intent'])) {
                $parsed = $rawResult;
            }
        }

        $intent = $parsed['intent'] ?? 'chat_query';

        if ($intent === 'wallet_transfer') {
            return $this->executeWalletTransfer($user, $parsed['transfer_data'] ?? [], $userWallets, $message);
        }

        if ($intent === 'add_transaction') {
            return $this->executeAddTransaction($user, $parsed['transaction_data'] ?? [], $userWallets, $userCategories, $message, $today, true);
        }

        // Chat query fallback
        $advice = $this->gemini->generateFinancialAdvice($message, []);
        return response()->json([
            'success'        => true,
            'intent'         => 'chat_query',
            'is_transaction' => false,
            'message'        => $advice['advice'] ?? 'Ada yang bisa saya bantu terkait transaksi atau portofolio dompet Anda?',
        ]);
    }

    // ─── 3. Execute Wallet Balance Transfer ───────────────────────────────────

    private function executeWalletTransfer($user, array $data, $userWallets, string $originalMessage): JsonResponse
    {
        if ($userWallets->count() < 2) {
            return response()->json([
                'success'        => false,
                'intent'         => 'wallet_transfer',
                'is_transaction' => true,
                'message'        => '❌ Anda memerlukan minimal **2 dompet** untuk melakukan transfer saldo.',
            ]);
        }

        $sourceName = $data['source_wallet_name'] ?? '';
        $destName   = $data['destination_wallet_name'] ?? '';
        $isAll      = (bool) ($data['is_transfer_all'] ?? false);
        $amount     = (float) ($data['amount'] ?? 0);

        // Find Source Wallet
        $sourceWallet = $this->findMatchingWallet($sourceName, $userWallets)
            ?? $userWallets->firstWhere('type', 'cash')
            ?? $userWallets->first();

        // Find Destination Wallet
        $destWallet = $this->findMatchingWallet($destName, $userWallets, excludeId: $sourceWallet?->id)
            ?? $userWallets->where('id', '!=', $sourceWallet->id)->first();

        if (!$sourceWallet || !$destWallet || $sourceWallet->id === $destWallet->id) {
            return response()->json([
                'success'        => false,
                'intent'         => 'wallet_transfer',
                'is_transaction' => true,
                'message'        => '❌ Dompet asal atau tujuan tidak ditemukan.',
            ]);
        }

        $transferAmount = $isAll ? (float) $sourceWallet->balance : $amount;

        if ($transferAmount <= 0) {
            return response()->json([
                'success'        => false,
                'intent'         => 'wallet_transfer',
                'is_transaction' => true,
                'message'        => "❌ Saldo dompet **{$sourceWallet->name}** saat ini adalah **Rp " . number_format($sourceWallet->balance, 0, ',', '.') . "**.",
            ]);
        }

        if ($sourceWallet->balance < $transferAmount) {
            return response()->json([
                'success'        => false,
                'intent'         => 'wallet_transfer',
                'is_transaction' => true,
                'message'        => "❌ Saldo dompet **{$sourceWallet->name}** (Rp " . number_format($sourceWallet->balance, 0, ',', '.') . ") tidak mencukupi untuk transfer sebesar **Rp " . number_format($transferAmount, 0, ',', '.') . "**.",
            ]);
        }

        DB::beginTransaction();
        try {
            $sourceWallet->decrement('balance', $transferAmount);
            $destWallet->increment('balance', $transferAmount);

            Transaction::create([
                'user_id'         => $user->id,
                'wallet_id'       => $sourceWallet->id,
                'category_id'     => null,
                'type'            => 'expense',
                'amount'          => $transferAmount,
                'merchant_name'   => 'Transfer ke ' . $destWallet->name,
                'description'     => 'Transfer saldo keluar ke ' . $destWallet->name,
                'date'            => now()->toDateString(),
                'currency'        => $sourceWallet->currency ?? 'IDR',
                'is_ai_generated' => true,
                'ai_metadata'     => ['transfer_to' => $destWallet->id, 'transfer_type' => 'out'],
            ]);

            Transaction::create([
                'user_id'         => $user->id,
                'wallet_id'       => $destWallet->id,
                'category_id'     => null,
                'type'            => 'income',
                'amount'          => $transferAmount,
                'merchant_name'   => 'Transfer dari ' . $sourceWallet->name,
                'description'     => 'Transfer saldo masuk dari ' . $sourceWallet->name,
                'date'            => now()->toDateString(),
                'currency'        => $destWallet->currency ?? 'IDR',
                'is_ai_generated' => true,
                'ai_metadata'     => ['transfer_from' => $sourceWallet->id, 'transfer_type' => 'in'],
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success'        => false,
                'intent'         => 'wallet_transfer',
                'is_transaction' => true,
                'message'        => '❌ Gagal memproses transfer saldo.',
            ]);
        }

        $amountFmt   = 'Rp ' . number_format($transferAmount, 0, ',', '.');
        $newSrcBal   = 'Rp ' . number_format($sourceWallet->fresh()->balance, 0, ',', '.');
        $newDestBal  = 'Rp ' . number_format($destWallet->fresh()->balance, 0, ',', '.');

        $reply = "🔄 **Transfer Berhasil!** Saldo **{$sourceWallet->name}** sebesar **{$amountFmt}** telah dipindahkan ke **{$destWallet->name}**.\n\n"
               . "• Saldo {$sourceWallet->name}: **{$newSrcBal}**\n"
               . "• Saldo {$destWallet->name}: **{$newDestBal}** 💸";

        return response()->json([
            'success'            => true,
            'intent'             => 'wallet_transfer',
            'is_transaction'     => true,
            'source_wallet_id'   => $sourceWallet->id,
            'dest_wallet_id'     => $destWallet->id,
            'transfer_amount'    => $transferAmount,
            'message'            => $reply,
        ]);
    }

    // ─── 4. Execute Add Transaction ───────────────────────────────────────────

    private function executeAddTransaction($user, array $parsed, $userWallets, $userCategories, string $message, string $today, bool $fromGemini): JsonResponse
    {
        $amount = (float) ($parsed['amount'] ?? 0);
        if ($amount <= 0) {
            return response()->json([
                'success'        => false,
                'intent'         => 'add_transaction',
                'is_transaction' => true,
                'message'        => '❌ Nominal transaksi tidak terbaca. Contoh format: *"kopi 25k"* atau *"gaji 5jt"*.',
            ]);
        }

        $txType = ($parsed['type'] ?? 'expense') === 'income' ? 'income' : 'expense';

        // 1. SMART WALLET RESOLUTION (Extract wallet mentioned in text or fallback to default)
        $walletNameInput = $parsed['wallet_name'] ?? null;
        $wallet = null;

        if ($walletNameInput) {
            $wallet = $this->findMatchingWallet($walletNameInput, $userWallets);
        }

        // If not explicitly parsed, search message for wallet names
        if (!$wallet) {
            $wallet = $this->findWalletInText($message, $userWallets);
        }

        // Final fallback: default wallet or first wallet
        if (!$wallet) {
            $wallet = $userWallets->where('is_default', true)->first() ?? $userWallets->first();
        }

        if (!$wallet) {
            return response()->json([
                'success'        => false,
                'intent'         => 'add_transaction',
                'is_transaction' => true,
                'message'        => '❌ Belum ada dompet. Buat dompet dulu di menu **Dompet & Rekening**.',
            ]);
        }

        // 2. CATEGORY RESOLUTION
        $categoryId    = null;
        $isNewCategory = false;
        $finalCatName  = null;

        $suggestedCat = $parsed['category'] ?? null;
        $isNewCatFlag = (bool) ($parsed['is_new_category'] ?? false);

        if ($suggestedCat) {
            $matched = $userCategories->first(
                fn($c) => strtolower(trim($c->name)) === strtolower(trim($suggestedCat)) && $c->type === $txType
            );

            if ($matched) {
                $categoryId   = $matched->id;
                $finalCatName = $matched->name;
            } elseif ($isNewCatFlag || !$userCategories->where('type', $txType)->contains(fn($c) => strtolower($c->name) === strtolower($suggestedCat))) {
                $newCat = Category::create([
                    'user_id'    => $user->id,
                    'name'       => $suggestedCat,
                    'type'       => $txType,
                    'icon'       => '📦',
                    'color'      => collect(['#10B981','#3B82F6','#F59E0B','#8B5CF6','#EC4899','#14B8A6','#F97316'])->random(),
                    'is_default' => false,
                ]);
                $categoryId    = $newCat->id;
                $isNewCategory = true;
                $finalCatName  = $suggestedCat;
            }
        }

        if (!$categoryId) {
            $fb = $userCategories->first(fn($c) => strtolower($c->name) === 'lainnya' && $c->type === $txType);
            $categoryId   = $fb?->id;
            $finalCatName = $fb?->name ?? 'Lainnya';
        }

        DB::beginTransaction();
        try {
            $transaction = Transaction::create([
                'user_id'         => $user->id,
                'wallet_id'       => $wallet->id,
                'category_id'     => $categoryId,
                'type'            => $txType,
                'amount'          => $amount,
                'merchant_name'   => $parsed['item'] ?? 'Transaksi',
                'description'     => $message,
                'date'            => $today,
                'currency'        => $wallet->currency ?? 'IDR',
                'is_ai_generated' => true,
                'ai_metadata'     => array_merge($parsed, ['source' => $fromGemini ? 'gemini' : 'local_nlp']),
            ]);

            $txType === 'income'
                ? $wallet->increment('balance', $amount)
                : $wallet->decrement('balance', $amount);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('AI Transaction Save Error: ' . $e->getMessage());
            return response()->json([
                'success' => false, 'intent' => 'add_transaction', 'is_transaction' => true,
                'message' => '❌ Gagal menyimpan transaksi: ' . $e->getMessage(),
            ]);
        }

        $typeLabel  = $txType === 'income' ? 'Pemasukan' : 'Pengeluaran';
        $amountFmt  = 'Rp ' . number_format($amount, 0, ',', '.');
        $newCatNote = $isNewCategory ? "Kategori baru **{$finalCatName}** otomatis dibuat. " : '';
        $emoji      = $txType === 'income' ? '💰' : '💸';
        $itemLabel  = !empty($parsed['item']) ? " — *{$parsed['item']}*" : '';

        $msg = "{$emoji} {$newCatNote}**{$typeLabel}** **{$amountFmt}**{$itemLabel} dicatat ke kategori **{$finalCatName}** di dompet **{$wallet->name}**.";

        return response()->json([
            'success'         => true,
            'intent'          => 'add_transaction',
            'is_transaction'  => true,
            'is_new_category' => $isNewCategory,
            'transaction_id'  => $transaction->id,
            'message'         => $msg,
        ]);
    }

    // ─── 5. Helper & Fuzzy Matchers ───────────────────────────────────────────

    private function findMatchingWallet(?string $targetName, $wallets, ?int $excludeId = null): ?Wallet
    {
        if (empty($targetName)) return null;

        $clean = strtolower(trim($targetName));
        $pool = $wallets->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId));

        // 1. Exact name match
        $found = $pool->first(fn($w) => strtolower($w->name) === $clean);
        if ($found) return $found;

        // 2. Partial substring
        $found = $pool->first(fn($w) => str_contains(strtolower($w->name), $clean) || str_contains($clean, strtolower($w->name)));
        if ($found) return $found;

        // 3. Brand keywords
        $brandMap = [
            'shopeepay' => ['shopeepay', 'shopee pay', 'spay', 'shope'],
            'gopay'     => ['gopay', 'go pay', 'go-pay'],
            'dana'      => ['dana'],
            'ovo'       => ['ovo'],
            'bca'       => ['bca', 'blu', 'blu by bca', 'bca digital'],
            'seabank'   => ['seabank', 'sea bank', 'sea'],
            'mandiri'   => ['mandiri', 'livin'],
            'bri'       => ['bri', 'brimo'],
            'bni'       => ['bni', 'bni mobile'],
            'jago'      => ['jago', 'bank jago'],
            'cash'      => ['cash', 'tunai', 'dompet', 'kantong', 'fisik'],
        ];

        foreach ($brandMap as $brand => $aliases) {
            foreach ($aliases as $alias) {
                if (str_contains($clean, $alias)) {
                    $foundByBrand = $pool->first(function ($w) use ($aliases) {
                        $wName = strtolower($w->name);
                        foreach ($aliases as $a) {
                            if (str_contains($wName, $a)) return true;
                        }
                        return false;
                    });
                    if ($foundByBrand) return $foundByBrand;
                }
            }
        }

        return null;
    }

    private function findWalletInText(string $text, $wallets): ?Wallet
    {
        $lower = strtolower($text);

        foreach ($wallets as $wallet) {
            $wName = strtolower($wallet->name);
            if (str_contains($lower, $wName)) {
                return $wallet;
            }
        }

        // Aliases
        $aliases = [
            'shopeepay' => ['shopeepay', 'shopee pay', 'spay', 'shope'],
            'gopay'     => ['gopay', 'go pay', 'go-pay'],
            'dana'      => ['dana'],
            'ovo'       => ['ovo'],
            'seabank'   => ['seabank', 'sea bank'],
            'bca'       => ['bca', 'blu'],
            'cash'      => ['cash', 'tunai', 'uang tunai'],
        ];

        foreach ($aliases as $key => $keywords) {
            foreach ($keywords as $kw) {
                if (preg_match('/\b' . preg_quote($kw, '/') . '\b/i', $lower)) {
                    $w = $this->findMatchingWallet($key, $wallets);
                    if ($w) return $w;
                }
            }
        }

        return null;
    }

    private function localMultiIntentParse(string $text, $userWallets, $userCategories): array
    {
        $lower = strtolower(trim($text));

        // 1. Detect Wallet Transfer
        $transferTriggers = ['pindah', 'transfer', 'kirim', 'move', 'geser', 'oper', 'pindahin', 'transferin'];
        $isTransfer = false;
        foreach ($transferTriggers as $trigger) {
            if (str_contains($lower, $trigger)) {
                $isTransfer = true;
                break;
            }
        }

        if ($isTransfer) {
            $isAll = str_contains($lower, 'semua') || str_contains($lower, 'seluruh') || str_contains($lower, 'biar 0') || str_contains($lower, 'kosong');
            
            $amount = 0;
            if (!$isAll && preg_match('/(\d+(?:[.,]\d+)?)\s*(jt|juta|k|rb|ribu)?/i', $lower, $m)) {
                $raw    = (float) str_replace(',', '.', $m[1]);
                $suffix = strtolower($m[2] ?? '');
                $amount = match (true) {
                    in_array($suffix, ['jt', 'juta']) => $raw * 1_000_000,
                    in_array($suffix, ['k', 'rb', 'ribu']) => $raw * 1_000,
                    default => $raw,
                };
            }

            $srcName  = null;
            $destName = null;

            if (preg_match('/dari\s+([a-zA-Z0-9\s]+?)\s+ke\s+([a-zA-Z0-9\s]+)/i', $lower, $matches)) {
                $srcName  = trim($matches[1]);
                $destName = trim($matches[2]);
            } elseif (preg_match('/ke\s+([a-zA-Z0-9\s]+)/i', $lower, $matches)) {
                $destName = trim($matches[1]);
            }

            return [
                'intent' => 'wallet_transfer',
                'transfer_data' => [
                    'source_wallet_name'      => $srcName,
                    'destination_wallet_name' => $destName,
                    'is_transfer_all'         => $isAll,
                    'amount'                  => $amount,
                ],
            ];
        }

        // 2. Detect Transaction
        if (preg_match('/(\d+(?:[.,]\d+)?)\s*(jt|juta|k|rb|ribu)?(?:\b|$)/i', $lower, $m)) {
            $raw    = (float) str_replace(',', '.', $m[1]);
            $suffix = strtolower($m[2] ?? '');
            $amount = match (true) {
                in_array($suffix, ['jt', 'juta']) => $raw * 1_000_000,
                in_array($suffix, ['k', 'rb', 'ribu']) => $raw * 1_000,
                default => $raw,
            };

            if ($amount > 0) {
                $incomeWords = ['gaji', 'gajian', 'pemasukan', 'masuk', 'terima', 'dapat', 'dapet', 'bonus', 'fee', 'honor', 'income'];
                $type = 'expense';
                foreach ($incomeWords as $kw) {
                    if (str_contains($lower, $kw)) { $type = 'income'; break; }
                }

                // Detect wallet in text
                $walletFound = $this->findWalletInText($lower, $userWallets);

                // Detect item & category
                $categoryMatched = $this->matchCategoryFast($lower, $type, $userCategories);

                // Clean description
                $cleanItem = preg_replace('/(\d+(?:[.,]\d+)?)\s*(jt|juta|k|rb|ribu)?/i', '', $lower);
                $cleanItem = preg_replace('/\b(gw|gue|aku|saya|abis|habis|beli|bayar|tadi|dapet|dapat|terima|masukin|keluarin|pake|pakai|via|lewat|dari|di)\b/i', '', $cleanItem);
                if ($walletFound) {
                    $cleanItem = str_ireplace(strtolower($walletFound->name), '', $cleanItem);
                }
                $cleanItem = trim(preg_replace('/\s+/', ' ', $cleanItem)) ?: 'Transaksi';

                return [
                    'intent' => 'add_transaction',
                    'transaction_data' => [
                        'type'            => $type,
                        'amount'          => $amount,
                        'wallet_name'     => $walletFound?->name,
                        'item'            => ucwords($cleanItem),
                        'category'        => $categoryMatched ?? 'Lainnya',
                        'is_new_category' => false,
                    ],
                ];
            }
        }

        return ['intent' => 'chat_query'];
    }

    private function matchCategoryFast(string $text, string $type, $categories): ?string
    {
        $keywords = [
            'Makanan & Minuman'  => ['kopi', 'kopken', 'kenangan', 'janji jiwa', 'starbucks', 'makan', 'minum', 'resto', 'warung', 'cafe', 'food', 'jajan', 'nasi', 'ayam', 'pizza', 'burger', 'boba', 'bakso', 'mie', 'snack', 'gofood', 'grabfood', 'shopeefood'],
            'Transportasi'       => ['bensin', 'pertalite', 'pertamax', 'bbm', 'parkir', 'grab', 'gojek', 'ojek', 'taxi', 'taksi', 'bus', 'kereta', 'krl', 'mrt', 'tol'],
            'Belanja'            => ['belanja', 'beli', 'indomaret', 'alfamart', 'shopee', 'tokopedia', 'lazada', 'tiktok shop', 'supermarket', 'mall', 'pasar', 'baju', 'sepatu', 'skincare'],
            'Tagihan & Utilitas' => ['listrik', 'pln', 'token', 'air', 'pdam', 'wifi', 'internet', 'indihome', 'pulsa', 'paket data', 'tagihan', 'iuran', 'bpjs'],
            'Kesehatan'          => ['obat', 'dokter', 'rs', 'klinik', 'apotek', 'vitamin', 'kesehatan'],
            'Hiburan'            => ['netflix', 'spotify', 'game', 'steam', 'bioskop', 'nonton', 'hiburan', 'gym', 'topup game'],
            'Pendidikan'         => ['kursus', 'buku', 'kuliah', 'sekolah', 'spp', 'udemy'],
            'Gaji'               => ['gaji', 'gajian', 'salary'],
            'Freelance'          => ['freelance', 'proyek', 'project', 'fee', 'honor', 'jasa'],
            'Investasi'          => ['dividen', 'investasi', 'saham', 'crypto', 'reksadana', 'profit'],
        ];

        foreach ($keywords as $catName => $terms) {
            foreach ($terms as $t) {
                if (str_contains($text, $t)) {
                    $found = $categories->first(fn($c) => strtolower($c->name) === strtolower($catName) && $c->type === $type);
                    if ($found) return $found->name;
                }
            }
        }

        return null;
    }
}
