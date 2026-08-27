import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Plus, Sparkles, CheckCircle2, TrendingUp,
    Calendar, ArrowRight, Wallet, Trash2, Pencil, X,
    AlertTriangle, Flame, Clock, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function formatCurrency(amount) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.abs(amount));
}

function GoalModal({ isOpen, onClose, editing = null }) {
    const { data, setData, post, put, errors, processing, reset } = useForm({
        name:           editing?.name           ?? '',
        target_amount:  editing?.target_amount  ?? '',
        daily_target:   editing?.daily_target   ?? '',
        current_amount: editing?.current_amount ?? '0',
        target_date:    editing?.target_date    ?? '',
        icon:           editing?.icon           ?? '🎯',
        color:          editing?.color          ?? '#2563EB',
    });

    const EMOJIS = ['🎯', '💻', '🚗', '🏠', '✈️', '💍', '📱', '🎓', '🏖️', '💼', '🛡️', '⚡'];
    const COLORS = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#4F46E5', '#0F172A'];

    const remainingToSave = Math.max(0, (Number(data.target_amount) || 0) - (Number(data.current_amount) || 0));
    const estimatedDays = (Number(data.daily_target) > 0 && remainingToSave > 0)
        ? Math.ceil(remainingToSave / Number(data.daily_target))
        : null;

    function handleSubmit(e) {
        e.preventDefault();
        const method = editing ? put : post;
        const url    = editing ? `/goals/${editing.id}` : '/goals';
        method(url, {
            onSuccess: () => {
                toast.success(editing ? 'Target diperbarui!' : 'Target tabungan baru dibuat!');
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
                        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl my-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold font-display text-slate-900">
                                    {editing ? 'Edit Target Impian' : 'Buat Target Tabungan Baru'}
                                </h3>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Target Impian</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Contoh: KE RANU KUMBOLO 2027, Beli MacBook..."
                                        className="input-luxury text-xs py-2"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Target (Rp)</label>
                                        <input
                                            type="number"
                                            value={data.target_amount}
                                            onChange={e => setData('target_amount', e.target.value)}
                                            placeholder="3000000"
                                            className="input-luxury text-xs py-2"
                                            required
                                        />
                                        {errors.target_amount && <p className="text-xs text-rose-500 mt-1">{errors.target_amount}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Sudah Ada (Rp)</label>
                                        <input
                                            type="number"
                                            value={data.current_amount}
                                            onChange={e => setData('current_amount', e.target.value)}
                                            placeholder="0"
                                            className="input-luxury text-xs py-2"
                                        />
                                    </div>
                                </div>

                                {/* Daily Target Plan */}
                                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center justify-between">
                                            <span>Target Nabung Harian (Opsional)</span>
                                            <span className="text-[10px] text-blue-600 font-normal">Rekomendasi</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.daily_target}
                                            onChange={e => setData('daily_target', e.target.value)}
                                            placeholder="Contoh: 10000 (Rp 10rb/hari)"
                                            className="input-luxury text-xs py-1.5 bg-white"
                                        />
                                    </div>

                                    {estimatedDays && (
                                        <div className="text-[11px] text-blue-800 flex items-center gap-1.5 font-medium pt-1 border-t border-blue-200/60">
                                            <Sparkles size={13} className="text-amber-500 flex-shrink-0" />
                                            <span>
                                                Dengan <b>{formatCurrency(data.daily_target)}/hari</b>, target akan terkumpul dalam <b>{estimatedDays} hari</b> (~{roundMonths(estimatedDays)} bulan).
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Tanggal Selesai (Opsional)</label>
                                    <input
                                        type="date"
                                        value={data.target_date}
                                        onChange={e => setData('target_date', e.target.value)}
                                        className="input-luxury text-xs py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Ikon</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {EMOJIS.map(em => (
                                            <button
                                                key={em}
                                                type="button"
                                                onClick={() => setData('icon', em)}
                                                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition-all cursor-pointer ${
                                                    data.icon === em ? 'border-emerald-600 bg-emerald-50 scale-110' : 'border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Aksen Warna</label>
                                    <div className="flex items-center gap-2">
                                        {COLORS.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setData('color', c)}
                                                style={{ backgroundColor: c }}
                                                className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                                                    data.color === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Batal</button>
                                    <button type="submit" disabled={processing} className="btn-primary text-xs">
                                        {editing ? 'Simpan Perubahan' : 'Buat Target Impian'}
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

function DepositModal({ isOpen, onClose, goal, wallets, defaultAmount = '' }) {
    const { data, setData, post, errors, processing, reset } = useForm({
        wallet_id: wallets[0]?.id ?? '',
        amount: defaultAmount || '',
    });

    function handleDeposit(e) {
        e.preventDefault();
        post(`/goals/${goal.id}/deposit`, {
            onSuccess: () => {
                reset(); onClose();
            },
        });
    }

    if (!goal) return null;

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
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                                        <span>{goal.icon}</span> Setor Dana: {goal.name}
                                    </h3>
                                    <p className="text-xs text-slate-400">Sisa target: {formatCurrency(goal.remaining)}</p>
                                </div>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
                            </div>

                            <form onSubmit={handleDeposit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Sumber Dompet</label>
                                    <select
                                        value={data.wallet_id}
                                        onChange={e => setData('wallet_id', e.target.value)}
                                        className="select-luxury text-xs py-2"
                                        required
                                    >
                                        {wallets.map(w => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} (Saldo: {formatCurrency(w.balance)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-semibold text-slate-700">Nominal Setoran (Rp)</label>
                                        {goal.daily_target && (
                                            <button
                                                type="button"
                                                onClick={() => setData('amount', String(goal.daily_target))}
                                                className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                                            >
                                                Pilih Target Harian ({formatCurrency(goal.daily_target)})
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        placeholder="Contoh: 10000"
                                        className="input-luxury text-xs py-2"
                                        max={goal.remaining}
                                        required
                                    />
                                    {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                                </div>

                                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-800">
                                    <Wallet size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>Saldo dompet yang dipilih akan otomatis terpotong dan dialokasikan ke target impian ini.</span>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Batal</button>
                                    <button type="submit" disabled={processing} className="btn-primary text-xs">
                                        Konfirmasi Setor Dana
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

function roundMonths(days) {
    return Math.round((days / 30) * 10) / 10;
}

export default function GoalsIndex({ goals, wallets, monthlySavings, totalSaved, totalTarget }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [depositGoal, setDepositGoal] = useState(null);
    const [depositPrefill, setDepositPrefill] = useState('');

    const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

    function openDeposit(goal, prefill = '') {
        setDepositGoal(goal);
        setDepositPrefill(prefill);
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                            Target Impian & Tabungan
                        </h2>
                        <p className="text-xs text-slate-500">Wujudkan impian dengan kalkulasi target harian cerdas dan pelacak kedisiplinan</p>
                    </div>
                    <div>
                        <button
                            onClick={() => { setEditingGoal(null); setModalOpen(true); }}
                            className="btn-primary text-xs w-full sm:w-auto"
                        >
                            <Plus size={15} /> Buat Target Baru
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Target Impian — FinanceOS" />

            {/* Top Summary Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="glass-card p-5 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dana Terkumpul</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-display text-emerald-600 font-mono">
                        {formatCurrency(totalSaved)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        Dari total target {formatCurrency(totalTarget)} ({overallPct}%)
                    </div>
                </div>

                <div className="glass-card p-5 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Kebutuhan Dana</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Target size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-display text-slate-900 font-mono">
                        {formatCurrency(Math.max(0, totalTarget - totalSaved))}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        {goals.length} pos impian aktif
                    </div>
                </div>

                <div className="glass-card p-5 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Surplus Bulanan Anda</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Sparkles size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-display text-amber-600 font-mono">
                        {formatCurrency(monthlySavings)} / bln
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        Kapasitas alokasi tabungan bulan ini
                    </div>
                </div>
            </div>

            {/* Goals Grid */}
            {goals.length === 0 ? (
                <div className="glass-card bg-white p-12 text-center border border-slate-200">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 text-3xl">
                        🎯
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Belum Ada Target Impian</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                        Mulai rencanakan pembelian aset, liburan ke Ranu Kumbolo, dana darurat, atau gadget impian Anda.
                    </p>
                    <button
                        onClick={() => { setEditingGoal(null); setModalOpen(true); }}
                        className="btn-primary text-xs inline-flex"
                    >
                        <Plus size={15} /> Buat Target Pertama
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((g) => {
                        return (
                            <motion.div
                                key={g.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 bg-white border border-slate-200 relative overflow-hidden flex flex-col justify-between"
                            >
                                <div
                                    className="absolute top-0 left-0 right-0 h-1.5"
                                    style={{ backgroundColor: g.color }}
                                />

                                <div>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                                                {g.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm font-display">{g.name}</h4>
                                                {g.target_date && (
                                                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Calendar size={12} /> Target: {g.target_date}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => { setEditingGoal(g); setModalOpen(true); }}
                                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Hapus target '${g.name}'?`)) {
                                                        router.delete(`/goals/${g.id}`, {
                                                            onSuccess: () => toast.success('Target berhasil dihapus!'),
                                                            onError: () => toast.error('Gagal menghapus target.'),
                                                        });
                                                    }
                                                }}
                                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                title="Hapus Target"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Daily Plan & Streak Badge */}
                                    {g.daily_target ? (
                                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                                <Zap size={14} className="text-amber-500" />
                                                <span>Plan: <b>{formatCurrency(g.daily_target)}/hari</b></span>
                                            </div>
                                            {g.streak_count > 0 && (
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                                                    <Flame size={13} className="text-orange-500" /> {g.streak_count} Hari Streak!
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    {/* Missed Days Alert */}
                                    {g.missed_days > 0 && !g.is_completed && (
                                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-3 space-y-1">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <AlertTriangle size={14} className="text-rose-600 flex-shrink-0" />
                                                <span>Terlewat menabung {g.missed_days} hari!</span>
                                            </div>
                                            <p className="text-[11px] text-rose-700 leading-tight">
                                                Kurang setoran {formatCurrency(g.missed_amount)}. Tanggal selesai otomatis bergeser mundur.
                                            </p>
                                        </div>
                                    )}

                                    {/* Progress Bar */}
                                    <div className="my-3">
                                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                            <span className="text-slate-900 font-mono">{formatCurrency(g.current_amount)}</span>
                                            <span className="text-slate-400 font-mono">{formatCurrency(g.target_amount)}</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${g.percentage}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: g.color }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                                            <span>Terkumpul {g.percentage}%</span>
                                            <span>Sisa {formatCurrency(g.remaining)}</span>
                                        </div>
                                    </div>

                                    {/* Smart Calculation Breakdown */}
                                    {g.is_completed ? (
                                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-2 mb-4">
                                            <CheckCircle2 size={15} /> Target Telah Tercapai
                                        </div>
                                    ) : g.days_remaining_by_daily ? (
                                        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs space-y-1 mb-4">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <Clock size={14} className="text-blue-600" />
                                                <span>Estimasi tercapai: <b>{g.days_remaining_by_daily} hari lagi</b> (~{g.months_remaining_by_daily} bln)</span>
                                            </div>
                                            <p className="text-[11px] text-blue-700">
                                                Target selesai pada: <b>{g.estimated_completion_date}</b>
                                            </p>
                                        </div>
                                    ) : null}
                                </div>

                                {!g.is_completed && (
                                    <div className="flex items-center gap-2 pt-2">
                                        {g.daily_target && (
                                            <button
                                                onClick={() => openDeposit(g, String(g.daily_target))}
                                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <Zap size={13} /> Setor Harian ({formatCurrency(g.daily_target)})
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openDeposit(g, '')}
                                            className={`${g.daily_target ? 'px-3' : 'w-full'} py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm`}
                                        >
                                            <Wallet size={14} /> Setor Bebas
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <GoalModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editing={editingGoal}
            />

            <DepositModal
                isOpen={!!depositGoal}
                onClose={() => { setDepositGoal(null); setDepositPrefill(''); }}
                goal={depositGoal}
                wallets={wallets}
                defaultAmount={depositPrefill}
            />
        </AuthenticatedLayout>
    );
}
