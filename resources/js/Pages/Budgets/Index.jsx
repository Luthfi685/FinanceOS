import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Target, AlertTriangle, CheckCircle2,
    Pencil, Trash2, X, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function formatCurrency(amount) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.abs(amount));
}

function BudgetModal({ isOpen, onClose, categories = [], currentPeriod, editing = null }) {
    const now = new Date();
    const { data, setData, post, put, errors, processing, reset } = useForm({
        category_id: editing?.category_id ?? (categories[0]?.id ?? ''),
        limit_amount: editing?.limit_amount ?? '',
        currency: 'IDR',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
    });

    function handleSubmit(e) {
        e.preventDefault();
        const method = editing ? put : post;
        const url = editing ? `/budgets/${editing.id}` : '/budgets';

        method(url, {
            onSuccess: () => {
                toast.success(editing ? 'Anggaran diperbarui!' : 'Anggaran ditetapkan!');
                reset(); onClose();
            },
            onError: () => toast.error('Periksa nominal anggaran.'),
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
                                <div>
                                    <h3 className="text-lg font-display font-bold text-slate-900">
                                        {editing ? 'Edit Target Anggaran' : 'Tetapkan Anggaran'}
                                    </h3>
                                    <p className="text-xs text-slate-400">Periode: {currentPeriod}</p>
                                </div>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!editing && (
                                    <div>
                                        <label className="label-luxury">Kategori Pengeluaran</label>
                                        <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="select-luxury" required>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="label-luxury">Batas Maksimal Pengeluaran (Rp)</label>
                                    <input
                                        type="number" min="1000" step="any"
                                        value={data.limit_amount}
                                        onChange={e => setData('limit_amount', e.target.value)}
                                        className="input-luxury font-mono text-lg font-bold"
                                        placeholder="Contoh: 3000000"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-3">
                                    <button type="button" onClick={onClose} className="btn-ghost flex-1">Batal</button>
                                    <button type="submit" disabled={processing} className="btn-primary flex-1 justify-center">
                                        {processing ? 'Menyimpan...' : (editing ? 'Simpan' : 'Tetapkan Anggaran')}
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

export default function BudgetsIndex({ budgets = [], categories = [], currentPeriod = '' }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const totalBudget = budgets.reduce((acc, b) => acc + parseFloat(b.limit_amount || 0), 0);
    const totalSpent = budgets.reduce((acc, b) => acc + parseFloat(b.spent_amount || 0), 0);
    const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    function handleDelete(b) {
        if (confirm(`Hapus batas anggaran "${b.category?.name}"?`)) {
            router.delete(`/budgets/${b.id}`, {
                onSuccess: () => toast.success('Anggaran berhasil dihapus!'),
            });
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">Target & Batas Anggaran</h2>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} className="text-slate-400" /> Periode {currentPeriod}
                        </p>
                    </div>
                    <div>
                        <button onClick={() => { setEditingBudget(null); setModalOpen(true); }} className="btn-primary text-xs w-full sm:w-auto">
                            <Plus size={15} /> Tetapkan Anggaran
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Anggaran — FinanceOS" />

            {/* Overview Summary */}
            <div className="glass-card p-6 bg-white border border-slate-200/80 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Alokasi Target</p>
                        <p className="text-2xl font-display font-extrabold text-slate-900 font-mono mt-1">{formatCurrency(totalBudget)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Realisasi Terpakai</p>
                        <p className={`text-2xl font-display font-extrabold font-mono mt-1 ${totalSpent > totalBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {formatCurrency(totalSpent)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Kapasitas Belanja</p>
                        <p className="text-2xl font-display font-extrabold text-amber-600 font-mono mt-1">
                            {formatCurrency(Math.max(0, totalBudget - totalSpent))}
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Tingkat Realisasi Keseluruhan</span>
                        <span>{overallPct.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar-track h-3">
                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${Math.min(overallPct, 100)}%`,
                                backgroundColor: overallPct > 100 ? '#E11D48' : overallPct > 80 ? '#D97706' : '#059669'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Budgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {budgets.map((b) => {
                    const isOver = b.is_over_budget;
                    const pct = b.percentage_used ?? 0;
                    const barColor = isOver ? '#E11D48' : pct > 80 ? '#D97706' : '#059669';

                    return (
                        <div key={b.id} className="glass-card p-6 bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                                             style={{ backgroundColor: `${b.category?.color ?? '#2563EB'}15`, color: b.category?.color ?? '#2563EB' }}>
                                            {b.category?.name?.charAt(0) ?? 'A'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">{b.category?.name}</h4>
                                            <p className="text-xs text-slate-400">{pct.toFixed(0)}% terpakai</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingBudget(b); setModalOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(b)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-baseline mb-2 text-sm">
                                    <span className="font-mono font-bold text-slate-900">{formatCurrency(b.spent_amount)}</span>
                                    <span className="font-mono text-xs text-slate-400">/ {formatCurrency(b.limit_amount)}</span>
                                </div>

                                <div className="progress-bar-track h-2 mb-3">
                                    <div className="progress-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                {isOver ? (
                                    <span className="flex items-center gap-1 text-rose-600 font-bold">
                                        <AlertTriangle size={13} /> Melebihi {formatCurrency(b.spent_amount - b.limit_amount)}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                        <CheckCircle2 size={13} /> Sisa {formatCurrency(b.remaining)}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <BudgetModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingBudget(null); }}
                categories={categories}
                currentPeriod={currentPeriod}
                editing={editingBudget}
            />
        </AuthenticatedLayout>
    );
}
