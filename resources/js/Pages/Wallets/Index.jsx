import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Wallet, Building2, Smartphone, Bitcoin,
    Banknote, Pencil, Trash2, X, Check, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const WALLET_TYPES = [
    { value: 'bank',     label: 'Rekening Bank',  icon: Building2,   color: '#2563EB' },
    { value: 'e-wallet', label: 'E-Wallet',        icon: Smartphone,  color: '#059669' },
    { value: 'crypto',   label: 'Crypto Vault',    icon: Bitcoin,     color: '#D97706' },
    { value: 'cash',     label: 'Uang Tunai',      icon: Banknote,    color: '#475569' },
];

const WALLET_COLORS = ['#2563EB', '#059669', '#D97706', '#E11D48', '#8B5CF6', '#06B6D4', '#475569'];

function WalletModal({ isOpen, onClose, editing = null }) {
    const { data, setData, post, put, errors, processing, reset } = useForm({
        name:       editing?.name       ?? '',
        type:       editing?.type       ?? 'bank',
        balance:    editing?.balance    ?? '0',
        currency:   editing?.currency   ?? 'IDR',
        color:      editing?.color      ?? '#2563EB',
        is_default: editing?.is_default ?? false,
    });

    function handleSubmit(e) {
        e.preventDefault();
        const method = editing ? put : post;
        const url    = editing ? `/wallets/${editing.id}` : '/wallets';
        method(url, {
            onSuccess: () => {
                toast.success(editing ? 'Dompet diperbarui!' : 'Dompet berhasil dibuat!');
                reset(); onClose();
            },
            onError: () => toast.error('Periksa form input Anda.'),
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-display font-bold text-slate-900">
                                    {editing ? 'Edit Dompet' : 'Tambah Dompet Baru'}
                                </h3>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label-luxury">Kategori Akun / Tipe</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {WALLET_TYPES.map(t => (
                                            <button key={t.value} type="button"
                                                onClick={() => setData('type', t.value)}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                                    data.type === t.value
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}>
                                                <t.icon size={16} style={{ color: t.color }} />
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="label-luxury">Nama Akun / Dompet</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-luxury" placeholder="BCA Prioritas, Rekening Utama, dll." required />
                                </div>

                                <div>
                                    <label className="label-luxury">Saldo Awal (Rp)</label>
                                    <input type="number" value={data.balance} onChange={e => setData('balance', e.target.value)} className="input-luxury font-mono text-base font-bold" min="0" step="any" required />
                                </div>

                                <div>
                                    <label className="label-luxury">Warna Tema</label>
                                    <div className="flex gap-2">
                                        {WALLET_COLORS.map(c => (
                                            <button key={c} type="button" onClick={() => setData('color', c)}
                                                className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all"
                                                style={{ backgroundColor: c, borderColor: data.color === c ? '#0F172A' : 'transparent' }}>
                                                {data.color === c && <Check size={12} className="text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-3">
                                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Batal</button>
                                    <button type="submit" disabled={processing} className="btn-primary flex-1 justify-center">
                                        {processing ? 'Menyimpan...' : (editing ? 'Simpan Perubahan' : 'Buat Dompet')}
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

export default function WalletsIndex({ wallets }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);

    const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);

    function handleDelete(wallet) {
        if (confirm(`Hapus dompet "${wallet.name}"?`)) {
            router.delete(`/wallets/${wallet.id}`, {
                onSuccess: () => toast.success('Dompet dihapus!'),
                onError: (err) => toast.error(err?.message || 'Dompet dengan transaksi tidak bisa dihapus.'),
            });
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">Dompet & Portofolio Aset</h2>
                        <p className="text-xs text-slate-500">Kelola seluruh rekening bank, e-wallet, crypto, dan tunai</p>
                    </div>
                    <div>
                        <button onClick={() => { setEditingWallet(null); setModalOpen(true); }} className="btn-primary text-xs w-full sm:w-auto">
                            <Plus size={15} /> Tambah Dompet
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dompet & Aset — FinanceOS" />

            {/* Total Balance Card */}
            <div className="glass-card p-6 bg-white border border-slate-200/80 mb-6 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Nilai Bersih Portofolio</p>
                    <p className="text-3xl font-display font-extrabold text-slate-900 font-mono tracking-tight mt-1">
                        Rp {new Intl.NumberFormat('id-ID').format(totalBalance)}
                    </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Wallet size={24} />
                </div>
            </div>

            {/* Wallet Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {wallets.map((w) => {
                    const typeObj = WALLET_TYPES.find(t => t.value === w.type) ?? WALLET_TYPES[0];
                    const IconComp = typeObj.icon;

                    return (
                        <div key={w.id} className="glass-card p-6 bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${w.color}15` }}>
                                        <IconComp size={20} style={{ color: w.color }} />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingWallet(w); setModalOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(w)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{typeObj.label}</p>
                                <h3 className="text-base font-bold text-slate-900 mt-0.5">{w.name}</h3>
                                <p className="text-2xl font-display font-extrabold text-slate-900 font-mono mt-2">
                                    Rp {new Intl.NumberFormat('id-ID').format(w.balance)}
                                </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                <span>Mata Uang: {w.currency}</span>
                                {w.is_default && <span className="text-blue-600 font-semibold">Utama</span>}
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={() => { setEditingWallet(null); setModalOpen(true); }}
                    className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-white/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-700 transition-all cursor-pointer min-h-[180px]"
                >
                    <Plus size={24} />
                    <span className="text-xs font-bold uppercase tracking-wider">Tambah Dompet / Rekening</span>
                </button>
            </div>

            <WalletModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingWallet(null); }}
                editing={editingWallet}
            />
        </AuthenticatedLayout>
    );
}
