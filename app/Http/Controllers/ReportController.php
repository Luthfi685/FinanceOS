<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Export transactions as clean CSV spreadsheet
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $user = Auth::user();
        $month = $request->input('month');
        $year = $request->input('year', Carbon::now()->year);

        $query = $user->transactions()
            ->with(['category:id,name', 'wallet:id,name'])
            ->latest('date');

        if ($month) {
            $query->whereMonth('date', $month);
        }
        if ($year) {
            $query->whereYear('date', $year);
        }

        $transactions = $query->get();
        $filename = 'FinanceOS_Laporan_' . ($month ? "Bulan_{$month}_" : '') . "{$year}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            
            // UTF-8 BOM for proper Excel display of IDR symbols
            fputs($handle, "\xEF\xBB\xBF");

            // CSV Header Row
            fputcsv($handle, [
                'ID Transaksi',
                'Tanggal',
                'Tipe',
                'Kategori',
                'Dompet / Rekening',
                'Nominal (IDR)',
                'Nama Merchant / Tempat',
                'Deskripsi / Catatan',
                'Dibuat Otomatis via AI'
            ], ';');

            foreach ($transactions as $tx) {
                fputcsv($handle, [
                    $tx->id,
                    $tx->date->format('Y-m-d'),
                    $tx->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                    $tx->category?->name ?? 'Lainnya',
                    $tx->wallet?->name ?? '-',
                    $tx->amount,
                    $tx->merchant_name ?? '-',
                    $tx->description ?? '-',
                    $tx->is_ai_generated ? 'Ya (Gemini)' : 'Manual',
                ], ';');
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Render Luxury Printable PDF Statement
     */
    public function exportPdf(Request $request)
    {
        $user = Auth::user();
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $periodDate = Carbon::createFromDate($year, $month, 1);
        $periodLabel = $periodDate->translatedFormat('F Y');

        $transactions = $user->transactions()
            ->with(['category:id,name', 'wallet:id,name'])
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->latest('date')
            ->get();

        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');
        $netCashFlow = $totalIncome - $totalExpense;
        $wallets = $user->wallets()->get();

        $categoryExpenses = $transactions->where('type', 'expense')
            ->groupBy(fn($t) => $t->category?->name ?? 'Lainnya')
            ->map(fn($group) => $group->sum('amount'))
            ->sortDesc();

        return view('reports.statement', [
            'user' => $user,
            'periodLabel' => $periodLabel,
            'transactions' => $transactions,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'netCashFlow' => $netCashFlow,
            'wallets' => $wallets,
            'categoryExpenses' => $categoryExpenses,
            'generatedAt' => Carbon::now()->translatedFormat('d F Y, H:i'),
        ]);
    }
}
