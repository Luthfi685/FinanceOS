import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, ArrowUpRight, ArrowDownRight,
    Trash2, Pencil, X, ChevronLeft, ChevronRight,
    ArrowLeftRight, Check, Camera, Sparkles, Calendar, Wallet,
    FileText, FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ScanReceiptModal from '@/Components/ScanReceiptModal';

function formatCurrency(amount) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.abs(amount));
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function TransactionModal({ isOpen, onClose, wallets, categories, editing = null }) {
    const { data, setData, post, put, errors, processing, reset } = useForm({
        wallet_id:    editing?.wallet_id   ?? (wallets[0]?.id ?? ''),
        category_id:  editing?.category_id ?? '',
        amount:       editing?.amount      ?? '',
        type:         editing?.type        ?? 'expense',
        description:  editing?.description ?? '',
        merchant_name:editing?.merchant_name ?? '',
        date:         editing?.date ? (editing.date.split('T')[0]) : new Date().toISOString().split('T')[0],
        currency:     editing?.currency     ?? 'IDR',
    });

    const filteredCats = categories.filter(c => c.type === data.type || data.type === 'transfer');

    function handleSubmit(e) {
        e.preventDefault();
        const method = editing ? put : post;
        const url    = editing ? `/transactions/${editing.id}` : '/transactions';
        method(url, {
            onSuccess: () => {
                toast.success(editing ? 'Transaksi diperbarui!' : 'Transaksi ditambahkan!');
                reset(); onClose();
            },
            onError: () => toast.error('Periksa kembali form Anda.'),
        });
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 15 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-display font-bold text-slate-900">
                                    {editing ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
                                </h3>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Type Toggle */}
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'expense')}
                                        className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                            data.type === 'expense' ? 'bg-white text-rose-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        Pengeluaran
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'income')}
                                        className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                            data.type === 'income' ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        Pemasukan
                                    </button>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        placeholder="0"
                                        className="input-luxury text-sm py-2.5 font-mono font-bold"
                                        required
                                    />
                                    {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                                </div>

                                {/* Merchant & Description */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant / Tempat</label>
                                        <input
                                            type="text"
                                            value={data.merchant_name}
                                            onChange={e => setData('merchant_name', e.target.value)}
                                            placeholder="Contoh: Kopi Kenangan, Indomaret..."
                                            className="input-luxury text-xs py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan / Keterangan</label>
                                        <input
                                            type="text"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Catatan tambahan..."
                                            className="input-luxury text-xs py-2"
                                        />
                                    </div>
                                </div>

                                {/* Wallet & Category */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Dompet / Rekening</label>
                                        <select
                                            value={data.wallet_id}
                                            onChange={e => setData('wallet_id', e.target.value)}
                                            className="select-luxury text-xs py-2"
                                            required
                                        >
                                            <option value="">Pilih Dompet</option>
                                            {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                        {errors.wallet_id && <p className="text-xs text-rose-500 mt-1">{errors.wallet_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                                        <select
                                            value={data.category_id}
                                            onChange={e => setData('category_id', e.target.value)}
                                            className="select-luxury text-xs py-2"
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {filteredCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Transaksi</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                        className="input-luxury text-xs py-2"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Batal</button>
                                    <button type="submit" disabled={processing} className="btn-primary text-xs">
                                        {editing ? 'Simpan Perubahan' : 'Catat Transaksi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function TransactionsIndex({ transactions, wallets = [], categories = [], filters = {} }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [scanModalOpen, setScanModalOpen] = useState(false);

    function handleFilter(key, value) {
        router.get('/transactions', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    function handleDelete(tx) {
        if (confirm(`Hapus transaksi "${tx.merchant_name || tx.description || 'ini'}"?`)) {
            router.delete(`/transactions/${tx.id}`, {
                onSuccess: () => toast.success('Transaksi berhasil dihapus!'),
                onError: () => toast.error('Gagal menghapus transaksi.'),
            });
        }
    }

    function handleReceiptScanned(scannedData) {
        setEditingTx({
            merchant_name: scannedData.merchant || '',
            amount:        scannedData.total    || '',
            date:          scannedData.date     || new Date().toISOString().split('T')[0],
            type:          'expense',
            description:   scannedData.items?.map(i => `${i.name} (${formatCurrency(i.price)})`).join(', ') || '',
            category_id:   '',
            wallet_id:     wallets[0]?.id || '',
        });
        setModalOpen(true);
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">Riwayat Transaksi</h2>
                        <p className="text-xs text-slate-500">Kelola dan pantau seluruh transaksi keuangan Anda</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Export Buttons */}
                        <a
                            href="/reports/export-pdf"
                            target="_blank"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                            title="Buka / Cetak Laporan PDF"
                        >
                            <FileText size={14} className="text-slate-600" /> Cetak PDF
                        </a>
                        <a
                            href="/reports/export-csv"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                            title="Unduh Spreadsheet CSV/Excel"
                        >
                            <FileSpreadsheet size={14} className="text-slate-600" /> CSV Excel
                        </a>

                        <button
                            onClick={() => setScanModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
                        >
                            <Sparkles size={14} className="text-amber-600" /> Scan Struk
                        </button>
                        <button
                            onClick={() => { setEditingTx(null); setModalOpen(true); }}
                            className="btn-primary text-xs"
                        >
                            <Plus size={15} /> Tambah Transaksi
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Transaksi — FinanceOS" />

            {/* Filter Bar */}
            <div className="glass-card p-4 bg-white mb-6 flex flex-wrap items-center gap-3 border border-slate-200">
                <div className="relative flex-1 min-w-[180px]">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text" value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleFilter('search', search)}
                        placeholder="Cari merchant atau catatan..."
                        className="input-luxury pl-9 py-2 text-xs"
                    />
                </div>

                <select value={filters?.type ?? ''} onChange={e => handleFilter('type', e.target.value)} className="select-luxury py-2 text-xs min-w-[120px]">
                    <option value="">Semua Tipe</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                </select>

                <select value={filters?.wallet_id ?? ''} onChange={e => handleFilter('wallet_id', e.target.value)} className="select-luxury py-2 text-xs min-w-[130px]">
                    <option value="">Semua Dompet</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>

            {/* Transactions Card / Table */}
            <div className="glass-card bg-white border border-slate-200 overflow-hidden">
                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-5">Rincian Transaksi</div>
                    <div className="col-span-2">Kategori</div>
                    <div className="col-span-2">Dompet</div>
                    <div className="col-span-2 text-right">Nominal</div>
                    <div className="col-span-1 text-right">Aksi</div>
                </div>

                <div className="divide-y divide-slate-100">
                    {transactions?.data?.length > 0 ? (
                        transactions.data.map((tx) => {
                            const isIncome = tx.type === 'income';
                            return (
                                <div
                                    key={tx.id}
                                    className="p-4 md:px-6 md:py-3.5 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 items-start md:items-center hover:bg-slate-50/60 transition-colors group"
                                >
                                    {/* Mobile & Desktop Main Info */}
                                    <div className="w-full md:col-span-5 flex items-center justify-between md:justify-start gap-3">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`w-10 h-10 md:w-9 md:h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                                isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                                {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold md:font-semibold text-slate-900 truncate">
                                                    {tx.merchant_name || tx.description || 'Transaksi'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 md:hidden">
                                                    <span>{formatDate(tx.date)}</span>
                                                    <span>•</span>
                                                    <span className="text-slate-600 font-medium">{tx.wallet?.name}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 hidden md:block">{formatDate(tx.date)}</p>
                                            </div>
                                        </div>

                                        {/* Mobile Amount (Top Right) */}
                                        <div className="text-right md:hidden">
                                            <span className={`text-sm font-bold font-mono ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Desktop Category */}
                                    <div className="col-span-2 hidden md:block">
                                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                                            {tx.category?.name ?? 'Umum'}
                                        </span>
                                    </div>

                                    {/* Desktop Wallet */}
                                    <div className="col-span-2 hidden md:block">
                                        <span className="text-xs text-slate-600 font-medium">{tx.wallet?.name}</span>
                                    </div>

                                    {/* Desktop Amount */}
                                    <div className="col-span-2 text-right hidden md:block">
                                        <span className={`text-sm font-bold font-mono ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </span>
                                    </div>

                                    {/* Mobile Bottom Row: Category Tag + Action Buttons */}
                                    <div className="w-full flex md:hidden items-center justify-between pt-2 border-t border-slate-50">
                                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                            {tx.category?.name ?? 'Umum'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => { setEditingTx(tx); setModalOpen(true); }}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                                title="Edit"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tx)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Desktop Action Buttons */}
                                    <div className="col-span-1 hidden md:flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditingTx(tx); setModalOpen(true); }}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                            title="Edit"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tx)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                            title="Hapus"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 text-slate-400 text-sm">Belum ada transaksi ditemukan</div>
                    )}
                </div>
            </div>

            <TransactionModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingTx(null); }}
                wallets={wallets}
                categories={categories}
                editing={editingTx}
            />

            <ScanReceiptModal
                isOpen={scanModalOpen}
                onClose={() => setScanModalOpen(false)}
                onScanned={handleReceiptScanned}
            />
        </AuthenticatedLayout>
    );
}
