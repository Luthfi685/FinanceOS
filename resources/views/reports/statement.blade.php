<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Finansial {{ $periodLabel }} - FinanceOS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        body {
            background-color: #F8FAFC;
            color: #0F172A;
            padding: 40px 20px;
        }
        .page {
            max-width: 900px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 20px;
            padding: 48px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            border: 1px solid #E2E8F0;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 28px;
            border-bottom: 2px solid #F1F5F9;
        }
        .brand-title {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #0F172A;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .brand-badge {
            background: #059669;
            color: white;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 6px;
            font-weight: 700;
        }
        .doc-info {
            text-align: right;
            font-size: 12px;
            color: #64748B;
            line-height: 1.6;
        }
        .doc-info strong {
            color: #0F172A;
            font-size: 14px;
        }
        .grid-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin: 28px 0;
        }
        .stat-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 20px;
        }
        .stat-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .stat-val {
            font-size: 20px;
            font-weight: 800;
        }
        .val-income { color: #059669; }
        .val-expense { color: #DC2626; }
        .val-net { color: #2563EB; }

        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #0F172A;
            margin: 28px 0 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        th {
            background: #F8FAFC;
            text-align: left;
            padding: 12px 14px;
            font-weight: 700;
            color: #475569;
            border-bottom: 1px solid #E2E8F0;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 12px 14px;
            border-bottom: 1px solid #F1F5F9;
            color: #334155;
        }
        tr:hover td {
            background: #F8FAFC;
        }
        .badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 6px;
        }
        .badge-income { background: #ECFDF5; color: #059669; }
        .badge-expense { background: #FEF2F2; color: #DC2626; }
        .amount-pos { font-weight: 700; color: #059669; }
        .amount-neg { font-weight: 700; color: #DC2626; }

        .print-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #0F172A;
            color: white;
            padding: 14px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            z-index: 50;
        }
        .print-btn:hover {
            transform: translateY(-2px);
            background: #1E293B;
        }
        .table-responsive {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 640px) {
            body {
                padding: 16px 12px;
            }
            .page {
                padding: 24px 20px;
            }
            .header {
                flex-direction: column;
                gap: 16px;
            }
            .doc-info {
                text-align: left;
            }
            .grid-stats {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            .print-btn {
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                font-size: 13px;
            }
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .page {
                box-shadow: none;
                border: none;
                padding: 0;
            }
            .print-btn {
                display: none;
            }
        }
    </style>
</head>
<body>

    <button class="print-btn" onclick="window.print()">
        🖨️ Cetak / Simpan PDF
    </button>

    <div class="page">
        <!-- Header -->
        <div class="header">
            <div>
                <div class="brand-title">
                    FinanceOS <span class="brand-badge">STATEMENT</span>
                </div>
                <p style="font-size: 13px; color: #64748B; margin-top: 4px;">
                    Laporan Keuangan & Mutasi Transaksi Resmi
                </p>
            </div>
            <div class="doc-info">
                <strong>{{ $user->name }}</strong><br>
                Periode: <b style="color: #0F172A;">{{ $periodLabel }}</b><br>
                Dicetak: {{ $generatedAt }}
            </div>
        </div>

        <!-- Summary Stats -->
        <div class="grid-stats">
            <div class="stat-card">
                <div class="stat-label">Total Pemasukan</div>
                <div class="stat-val val-income">Rp {{ number_format($totalIncome, 0, ',', '.') }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Pengeluaran</div>
                <div class="stat-val val-expense">Rp {{ number_format($totalExpense, 0, ',', '.') }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Arus Kas Bersih (Surplus)</div>
                <div class="stat-val val-net">Rp {{ number_format($netCashFlow, 0, ',', '.') }}</div>
            </div>
        </div>

        <!-- Wallets Status -->
        <div class="section-title">
            <span>Rekap Saldo Dompet</span>
            <span style="font-size: 12px; font-weight: 500; color: #64748B;">Total Aset: Rp {{ number_format($wallets->sum('balance'), 0, ',', '.') }}</span>
        </div>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Nama Dompet</th>
                        <th>Tipe Akun</th>
                        <th style="text-align: right;">Saldo Saat Ini</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($wallets as $w)
                    <tr>
                        <td style="font-weight: 600;">{{ $w->name }}</td>
                        <td>{{ $w->type_label }}</td>
                        <td style="text-align: right; font-weight: 700;">Rp {{ number_format($w->balance, 0, ',', '.') }}</td>
                    </tr>
                    @empty
                    <tr><td colspan="3" style="text-align: center; color: #94A3B8;">Belum ada dompet</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Category Breakdown -->
        @if($categoryExpenses->isNotEmpty())
        <div class="section-title">
            <span>Rincian Pengeluaran per Kategori</span>
        </div>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Kategori</th>
                        <th style="text-align: right;">Total Pengeluaran</th>
                        <th style="text-align: right;">Porsi</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($categoryExpenses as $catName => $amount)
                    @php $pct = $totalExpense > 0 ? round(($amount / $totalExpense) * 100, 1) : 0; @endphp
                    <tr>
                        <td style="font-weight: 600;">{{ $catName }}</td>
                        <td style="text-align: right; font-weight: 700; color: #DC2626;">Rp {{ number_format($amount, 0, ',', '.') }}</td>
                        <td style="text-align: right; font-weight: 600; color: #64748B;">{{ $pct }}%</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Transactions History -->
        <div class="section-title">
            <span>Daftar Transaksi ({{ $transactions->count() }} Data)</span>
        </div>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Keterangan / Merchant</th>
                        <th>Kategori</th>
                        <th>Dompet</th>
                        <th style="text-align: right;">Nominal</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($transactions as $tx)
                    <tr>
                        <td style="font-size: 12px; color: #64748B; font-weight: 500;">{{ $tx->date->format('d/m/Y') }}</td>
                        <td style="font-weight: 600;">
                            {{ $tx->merchant_name ?? $tx->description ?? 'Transaksi' }}
                        </td>
                        <td><span class="badge {{ $tx->type === 'income' ? 'badge-income' : 'badge-expense' }}">{{ $tx->category?->name ?? 'Lainnya' }}</span></td>
                        <td style="font-size: 12px; color: #64748B;">{{ $tx->wallet?->name ?? '-' }}</td>
                        <td style="text-align: right;" class="{{ $tx->type === 'income' ? 'amount-pos' : 'amount-neg' }}">
                            {{ $tx->type === 'income' ? '+' : '-' }}Rp {{ number_format($tx->amount, 0, ',', '.') }}
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="5" style="text-align: center; color: #94A3B8; padding: 24px;">Tidak ada transaksi di periode ini</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
            Dokumen ini di-generate secara otomatis oleh <strong>FinanceOS</strong> pada {{ $generatedAt }}.
        </div>
    </div>

</body>
</html>
