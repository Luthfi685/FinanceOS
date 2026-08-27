import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, ArrowUpRight, ArrowDownRight,
    Pencil, Trash2, X, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const COLOR_PALETTE = [
    '#2563EB', '#059669', '#D97706', '#E11D48',
    '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'
];

function CategoryModal({ isOpen, onClose, editing = null }) {
    const { data, setData, post, put, errors, processing, reset } = useForm({
        name: editing?.name ?? '',
        type: editing?.type ?? 'expense',
        icon: editing?.icon ?? 'UtensilsCrossed',
        color: editing?.color ?? '#2563EB',
    });

    function handleSubmit(e) {
        e.preventDefault();
        const method = editing ? put : post;
        const url = editing ? `/categories/${editing.id}` : '/categories';
        method(url, {
            onSuccess: () => {
                toast.success(editing ? 'Kategori diperbarui!' : 'Kategori dibuat!');
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
                                    {editing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                                </h3>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!editing && (
                                    <div>
                                        <label className="label-luxury">Tipe Kategori</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setData('type', 'expense')}
                                                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                                    data.type === 'expense'
                                                        ? 'border-rose-600 bg-rose-50 text-rose-700'
                                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                <ArrowDownRight size={15} /> Pengeluaran
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('type', 'income')}
                                                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                                    data.type === 'income'
                                                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                <ArrowUpRight size={15} /> Pemasukan
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="label-luxury">Nama Kategori</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="input-luxury"
                                        placeholder="Contoh: Belanja Bulanan"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label-luxury">Warna Tema</label>
                                    <div className="flex gap-2">
                                        {COLOR_PALETTE.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setData('color', c)}
                                                className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center"
                                                style={{
                                                    backgroundColor: c,
                                                    borderColor: data.color === c ? '#0F172A' : 'transparent',
                                                }}
                                            >
                                                {data.color === c && <Check size={12} className="text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-3">
                                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Batal</button>
                                    <button type="submit" disabled={processing} className="btn-primary flex-1 justify-center">
                                        {processing ? 'Menyimpan...' : (editing ? 'Simpan' : 'Buat Kategori')}
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

export default function CategoriesIndex({ categories = [] }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('expense');

    const filtered = categories.filter(c => c.type === activeTab);

    function handleDelete(category) {
        if (confirm(`Hapus kategori "${category.name}"?`)) {
            router.delete(`/categories/${category.id}`, {
                onSuccess: () => toast.success('Kategori dihapus!'),
                onError: () => toast.error('Kategori bawaan sistem tidak bisa dihapus.'),
            });
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">Kategori Transaksi</h2>
                        <p className="text-xs text-slate-500">Struktur pos pengeluaran dan pemasukan</p>
                    </div>
                    <div>
                        <button onClick={() => { setEditingCategory(null); setModalOpen(true); }} className="btn-primary text-xs w-full sm:w-auto">
                            <Plus size={15} /> Tambah Kategori
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Kategori — FinanceOS" />

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('expense')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'expense'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                >
                    <ArrowDownRight size={14} /> Pengeluaran ({categories.filter(c => c.type === 'expense').length})
                </button>
                <button
                    onClick={() => setActiveTab('income')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'income'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                >
                    <ArrowUpRight size={14} /> Pemasukan ({categories.filter(c => c.type === 'income').length})
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((category) => (
                    <div
                        key={category.id}
                        className="glass-card p-4 bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                                style={{
                                    backgroundColor: `${category.color}15`,
                                    color: category.color,
                                }}
                            >
                                {category.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 truncate max-w-[130px]">{category.name}</h4>
                                <p className="text-xs text-slate-400">{category.transactions_count ?? 0} transaksi</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingCategory(category); setModalOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100">
                                <Pencil size={14} />
                            </button>
                            {!category.is_default && (
                                <button onClick={() => handleDelete(category)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <CategoryModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingCategory(null); }}
                editing={editingCategory}
            />
        </AuthenticatedLayout>
    );
}
