import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    MessageSquare, CheckCircle2, Copy, Check, ExternalLink,
    Zap, Sparkles, Smartphone, Clock, Camera, Pencil, Link2
} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function formatCurrency(amount) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.abs(amount));
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function WhatsAppBotIndex({
    botPhone = '6283176325931',
    linkedPhone = '',
    webhookUrl = 'https://financeos-fh71.onrender.com/api/webhook/whatsapp',
    recentTransactions = [],
}) {
    const [copiedUrl, setCopiedUrl]           = useState(false);
    const [copiedExample, setCopiedExample]   = useState('');
    const [isEditingPhone, setIsEditingPhone] = useState(!linkedPhone);

    const { data, setData, post, processing } = useForm({ whatsapp_number: linkedPhone });

    const displayPhone = linkedPhone
        ? (linkedPhone.startsWith('62')
            ? `+${linkedPhone.slice(0, 2)} ${linkedPhone.slice(2, 5)}-${linkedPhone.slice(5, 9)}-${linkedPhone.slice(9)}`
            : linkedPhone)
        : 'Belum Terhubung';

    const waLink = `https://wa.me/6283176325931?text=saldo`;

    function copyToClipboard(text, id) {
        navigator.clipboard.writeText(text);
        if (id === 'url') {
            setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000);
            toast.success('URL Webhook disalin!');
        } else {
            setCopiedExample(id); setTimeout(() => setCopiedExample(''), 2000);
            toast.success('Disalin!');
        }
    }

    function handleSavePhone(e) {
        e.preventDefault();
        post('/whatsapp-bot/number', {
            onSuccess: () => { setIsEditingPhone(false); toast.success('Nomor berhasil disimpan!'); },
            onError: () => toast.error('Gagal menyimpan nomor.'),
        });
    }

    const QUICK_EXAMPLES = [
        { label: 'Keluar',   text: 'Kopi Kenangan 28rb bca',           desc: 'Catat pengeluaran' },
        { label: 'Keluar',   text: 'Bensin 35000 tunai',               desc: 'Potong dompet Tunai' },
        { label: 'Masuk',    text: 'Gaji freelance masuk 2jt bca',     desc: 'Tambah saldo BCA' },
        { label: 'Transfer', text: 'Transfer 100rb dari BCA ke GoPay', desc: 'Pindah antar dompet' },
        { label: 'Saldo',    text: 'saldo',                            desc: 'Lihat semua saldo' },
        { label: 'Laporan',  text: 'ringkasan',                        desc: 'Ringkasan bulan ini' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Bot Aktif
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <Sparkles size={11} /> Gemini AI
                            </span>
                        </div>
                        <h2 className="text-xl font-display font-bold text-slate-900">WhatsApp Bot</h2>
                        <p className="text-xs text-slate-500">Catat transaksi & cek saldo langsung via chat WA</p>
                    </div>
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all">
                        <ExternalLink size={14} /> Buka WhatsApp Bot
                    </a>
                </div>
            }
        >
            <Head title="WhatsApp Bot â€” FinanceOS" />

            <div className="space-y-5">
                {/* â”€â”€ Status Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nomor WA */}
                    <div className="glass-card p-4 bg-white border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nomor WA Kamu</span>
                            <Smartphone size={15} className="text-slate-300" />
                        </div>
                        {isEditingPhone ? (
                            <form onSubmit={handleSavePhone} className="space-y-2">
                                <input type="text" value={data.whatsapp_number}
                                    onChange={e => setData('whatsapp_number', e.target.value)}
                                    placeholder="08xxxxxxxxxx" className="input-luxury text-xs py-1.5 font-mono" required />
                                <div className="flex gap-2">
                                    <button type="submit" disabled={processing} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
                                        {processing ? '...' : 'Simpan'}
                                    </button>
                                    {linkedPhone && (
                                        <button type="button" onClick={() => setIsEditingPhone(false)} className="px-3 py-1 rounded-lg text-slate-600 text-[11px] hover:bg-slate-100">Batal</button>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-base font-bold font-mono text-slate-900">{displayPhone}</p>
                                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                        <CheckCircle2 size={11} /> Terhubung
                                    </p>
                                </div>
                                <button onClick={() => setIsEditingPhone(true)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400" title="Ubah nomor">
                                    <Pencil size={13} />
                                </button>
                            </div>
                        )}
                        <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-400">
                            <span>Nomor Bot:</span>
                            <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 hover:underline">+62 831-7632-5931 â†—</a>
                        </div>
                    </div>

                    {/* AI Capabilities */}
                    <div className="glass-card p-4 bg-white border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kemampuan AI</span>
                            <Zap size={15} className="text-blue-400" />
                        </div>
                        <p className="text-base font-bold text-slate-900">NLP + Scan Struk</p>
                        <div className="space-y-1.5 mt-2">
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                Baca bahasa santai ("kopi 25rb bca")
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                Foto struk Alfamart / Indomaret
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                                Laporan & ringkasan bulanan
                            </p>
                        </div>
                        <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-400">
                            <span>Response:</span>
                            <span className="font-semibold text-emerald-600 font-mono">&lt; 1.5 detik</span>
                        </div>
                    </div>
                </div>

                {/* â”€â”€ Quick Commands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="glass-card p-5 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900 font-display">Contoh Perintah</h4>
                        <span className="text-xs text-slate-400">klik untuk salin</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {QUICK_EXAMPLES.map((ex, idx) => (
                            <div key={idx} onClick={() => copyToClipboard(ex.text, String(idx))}
                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 transition-all flex items-center justify-between group cursor-pointer">
                                <div className="min-w-0 pr-2">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[10px] font-bold px-1.5 py-px rounded bg-white border border-slate-200 text-slate-600">{ex.label}</span>
                                        <span className="text-xs font-mono font-bold text-slate-900 truncate">"{ex.text}"</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">{ex.desc}</p>
                                </div>
                                {copiedExample === String(idx)
                                    ? <Check size={13} className="text-emerald-600 flex-shrink-0" />
                                    : <Copy size={13} className="text-slate-300 group-hover:text-blue-500 flex-shrink-0" />}
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
                        <Camera size={15} className="text-amber-600 flex-shrink-0" />
                        <span><b>Scan Struk:</b> Foto bon belanjaan lalu kirim ke bot â€” AI otomatis deteksi nominal & merchant!</span>
                    </div>
                </div>

                {/* â”€â”€ Webhook URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="glass-card p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Link2 size={14} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">Endpoint Webhook Fonnte</span>
                        </div>
                        <button onClick={() => copyToClipboard(webhookUrl, 'url')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer">
                            {copiedUrl ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            {copiedUrl ? 'Tersalin!' : 'Salin'}
                        </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-600 select-all break-all">
                        {webhookUrl}
                    </div>
                </div>

                {/* â”€â”€ Recent Transactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="glass-card p-5 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" /> Transaksi via WhatsApp
                        </h3>
                        <span className="text-xs text-slate-400">{recentTransactions.length} transaksi</span>
                    </div>

                    {recentTransactions.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl">
                            <MessageSquare size={24} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-bold text-slate-600">Belum ada transaksi</p>
                            <p className="text-xs text-slate-400 mt-0.5">Kirim "Kopi 25rb bca" ke bot untuk mulai!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentTransactions.map((tx) => {
                                const isIncome = tx.type === 'income';
                                return (
                                    <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                                isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                                {isIncome ? 'â†“' : 'â†‘'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{tx.merchant_name || tx.description}</p>
                                                <p className="text-[11px] text-slate-400">{formatDate(tx.date)} Â· {tx.wallet?.name || 'Dompet'} Â· {tx.category?.name || 'Umum'}</p>
                                            </div>
                                        </div>
                                        <p className={`text-xs font-bold font-mono flex-shrink-0 ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
