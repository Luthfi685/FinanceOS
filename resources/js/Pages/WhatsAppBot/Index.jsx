import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    MessageSquare, CheckCircle2, Copy, Check, ExternalLink,
    Zap, Sparkles, Smartphone, ShieldCheck, ArrowRight,
    TrendingUp, Wallet, Clock, Camera, RefreshCw, Send,
    Pencil, AlertCircle
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
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

export default function WhatsAppBotIndex({
    linkedPhone = '6283126435560',
    isConfigured = true,
    webhookUrl = 'https://financeos-fh71.onrender.com/api/webhook/whatsapp',
    recentTransactions = [],
    wallets = []
}) {
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedExample, setCopiedExample] = useState('');
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    const { data, setData, post, processing } = useForm({
        whatsapp_number: linkedPhone,
    });

    const displayPhone = linkedPhone.startsWith('62')
        ? `+${linkedPhone.slice(0, 2)} ${linkedPhone.slice(2, 5)}-${linkedPhone.slice(5, 9)}-${linkedPhone.slice(9)}`
        : linkedPhone;

    const waLink = `https://wa.me/${linkedPhone.replace(/[^0-9]/g, '')}`;

    function copyToClipboard(text, id) {
        navigator.clipboard.writeText(text);
        if (id === 'url') {
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
            toast.success('URL Webhook disalin ke clipboard!');
        } else {
            setCopiedExample(id);
            setTimeout(() => setCopiedExample(''), 2000);
            toast.success(`Disalin: "${text}"`);
        }
    }

    function handleSavePhone(e) {
        e.preventDefault();
        post('/whatsapp-bot/number', {
            onSuccess: () => {
                setIsEditingPhone(false);
                toast.success('Nomor WhatsApp berhasil diperbarui!');
            },
            onError: () => toast.error('Gagal menyimpan nomor WhatsApp.'),
        });
    }

    const QUICK_EXAMPLES = [
        { label: 'Pengeluaran', text: 'Kopi Kenangan 28rb bca', desc: 'Catat belanjaan/jajan kopi' },
        { label: 'Pengeluaran', text: 'Bensin Pertalite 35000 tunai', desc: 'Otomatis potong dompet Tunai' },
        { label: 'Pemasukan', text: 'Gaji freelance masuk 2jt bca', desc: 'Otomatis tambah saldo dompet BCA' },
        { label: 'Transfer', text: 'Transfer 100rb dari BCA ke GoPay', desc: 'Pindahkan saldo antar dompet' },
        { label: 'Cek Saldo', text: 'saldo', desc: 'Lihat semua saldo dompet real-time' },
        { label: 'Laporan', text: 'ringkasan', desc: 'Evaluasi pemasukan vs pengeluaran bulan ini' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Bot Aktif & Terhubung
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <Sparkles size={11} className="text-blue-600" /> Powered by Gemini AI
                            </span>
                        </div>
                        <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                            Integrasi WhatsApp Bot
                        </h2>
                        <p className="text-xs text-slate-500">Catat transaksi, cek saldo, dan scan struk langsung lewat chat WhatsApp tanpa perlu buka web</p>
                    </div>
                    <div>
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                            <ExternalLink size={15} />
                            Buka WhatsApp Bot
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="WhatsApp Bot — FinanceOS" />

            <div className="space-y-6">
                {/* ── Top Overview Grid ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Linked Number */}
                    <div className="glass-card p-5 bg-white border border-slate-200 relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nomor Bot Terhubung</span>
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Smartphone size={16} />
                                </div>
                            </div>

                            {isEditingPhone ? (
                                <form onSubmit={handleSavePhone} className="space-y-2 my-2">
                                    <input
                                        type="text"
                                        value={data.whatsapp_number}
                                        onChange={e => setData('whatsapp_number', e.target.value)}
                                        placeholder="083126435560 atau 628..."
                                        className="input-luxury text-xs py-1.5 font-mono"
                                        required
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                                        >
                                            Simpan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingPhone(false)}
                                            className="px-3 py-1 rounded-lg text-slate-600 text-[11px] font-medium hover:bg-slate-100"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div className="text-xl font-bold font-mono text-slate-900 tracking-tight flex items-center gap-2">
                                        <span>{displayPhone}</span>
                                        <button
                                            onClick={() => setIsEditingPhone(true)}
                                            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                                            title="Ubah nomor"
                                        >
                                            <Pencil size={13} />
                                        </button>
                                    </div>
                                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                                        <CheckCircle2 size={13} /> Terverifikasi via Fonnte Gateway
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Penyedia:</span>
                            <span className="font-semibold text-slate-700">Fonnte WhatsApp API</span>
                        </div>
                    </div>

                    {/* Card 2: AI Capabilities */}
                    <div className="glass-card p-5 bg-white border border-slate-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fitur AI yang Siap</span>
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Zap size={16} />
                                </div>
                            </div>
                            <div className="text-xl font-bold font-display text-slate-900">
                                NLP & OCR Struk
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                                <p>• Baca bahasa santai ("kopi 25rb bca")</p>
                                <p>• Scan foto bon struk Alfamart/Indomaret</p>
                            </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Response Speed:</span>
                            <span className="font-semibold text-emerald-600 font-mono">&lt; 1.5 detik</span>
                        </div>
                    </div>

                    {/* Card 3: Direct Action */}
                    <div className="glass-card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col justify-between shadow-lg">
                        <div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Mulai Mencatat</span>
                            <h3 className="text-base font-bold font-display mt-1 mb-2">Langsung Coba Sekarang</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Buka WhatsApp, kirim kata <b>saldo</b> atau nominal jajanmu hari ini untuk melihat keajaibannya.
                            </p>
                        </div>
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                        >
                            <span>Mulai Chatting</span>
                            <ArrowRight size={14} />
                        </a>
                    </div>
                </div>

                {/* ── Simulated WhatsApp Chat Showcase & Commands ──────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Interactive WhatsApp Simulation */}
                    <div className="lg:col-span-6 glass-card p-6 bg-white border border-slate-200">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                    <MessageSquare size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">FinanceOS WhatsApp Bot</h4>
                                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online • Siap mencatat
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">Live Demo</span>
                        </div>

                        {/* Chat Messages */}
                        <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-h-[380px] overflow-y-auto font-sans">
                            {/* User Bubble 1 */}
                            <div className="flex justify-end">
                                <div className="bg-emerald-100 text-slate-800 text-xs p-3 rounded-2xl rounded-tr-xs max-w-[80%] shadow-2xs">
                                    <p className="font-medium">Kopi Kenangan 28rb bca</p>
                                    <span className="text-[9px] text-emerald-700 block text-right mt-1">12:30 ✓✓</span>
                                </div>
                            </div>

                            {/* Bot Bubble 1 */}
                            <div className="flex justify-start">
                                <div className="bg-white text-slate-800 text-xs p-3.5 rounded-2xl rounded-tl-xs max-w-[85%] shadow-xs border border-slate-200/70 space-y-1">
                                    <p className="font-bold text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 size={13} /> Transaksi Berhasil Dicatat!
                                    </p>
                                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                                        <p>• <b>Jenis:</b> 🔴 Pengeluaran</p>
                                        <p>• <b>Nominal:</b> Rp 28.000</p>
                                        <p>• <b>Keterangan:</b> Kopi Kenangan</p>
                                        <p>• <b>Kategori:</b> Makanan & Minuman</p>
                                        <p>• <b>Dompet:</b> BCA (Sisa: Rp 3.425.000)</p>
                                    </div>
                                    <span className="text-[9px] text-slate-400 block text-right pt-0.5">12:30</span>
                                </div>
                            </div>

                            {/* User Bubble 2 */}
                            <div className="flex justify-end">
                                <div className="bg-emerald-100 text-slate-800 text-xs p-2.5 rounded-2xl rounded-tr-xs max-w-[80%] shadow-2xs">
                                    <p className="font-medium">saldo</p>
                                    <span className="text-[9px] text-emerald-700 block text-right mt-0.5">12:31 ✓✓</span>
                                </div>
                            </div>

                            {/* Bot Bubble 2 */}
                            <div className="flex justify-start">
                                <div className="bg-white text-slate-800 text-xs p-3 rounded-2xl rounded-tl-xs max-w-[85%] shadow-xs border border-slate-200/70 space-y-1">
                                    <p className="font-bold text-slate-900">📊 Ringkasan Dompet & Saldo</p>
                                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                                        <p>🏦 <b>BCA:</b> Rp 3.425.000</p>
                                        <p>📱 <b>GoPay:</b> Rp 150.000</p>
                                        <p>💵 <b>Tunai:</b> Rp 200.000</p>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-900 pt-1 border-t border-slate-100">
                                        ✨ Total Kekayaan: Rp 3.775.000
                                    </p>
                                    <span className="text-[9px] text-slate-400 block text-right pt-0.5">12:31</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Command Cheat Sheet */}
                    <div className="lg:col-span-6 glass-card p-6 bg-white border border-slate-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div>
                                    <h4 className="text-base font-bold text-slate-900 font-display">Daftar Perintah Cepat</h4>
                                    <p className="text-xs text-slate-400">Klik salah satu contoh untuk menyalin teksnya</p>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">6 Format</span>
                            </div>

                            <div className="space-y-2.5">
                                {QUICK_EXAMPLES.map((ex, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => copyToClipboard(ex.text, String(idx))}
                                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 transition-all flex items-center justify-between group cursor-pointer"
                                    >
                                        <div className="min-w-0 pr-3">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-slate-700">
                                                    {ex.label}
                                                </span>
                                                <span className="text-xs font-bold font-mono text-slate-900 truncate">
                                                    "{ex.text}"
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">{ex.desc}</p>
                                        </div>
                                        <button className="text-slate-400 group-hover:text-blue-600 transition-colors p-1">
                                            {copiedExample === String(idx) ? (
                                                <Check size={15} className="text-emerald-600" />
                                            ) : (
                                                <Copy size={15} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Photo receipt tip */}
                        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                            <Camera size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold">Tips Scan Struk Belanjaan:</span>
                                <p className="text-[11px] text-amber-800 mt-0.5">
                                    Cukup foto struk belanjaanmu dari WhatsApp dan kirim ke nomor bot. AI Vision akan otomatis mendeteksi nama merchant dan total nominalnya!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Webhook Settings Reference ─────────────────────────────────── */}
                <div className="glass-card p-5 bg-white border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                                <span>🔗</span> Endpoint Webhook Fonnte
                            </h4>
                            <p className="text-xs text-slate-500">URL server yang dipanggil oleh Fonnte saat ada pesan WhatsApp baru masuk</p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(webhookUrl, 'url')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer w-fit"
                        >
                            {copiedUrl ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            {copiedUrl ? 'Tersalin!' : 'Salin URL Webhook'}
                        </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 select-all break-all">
                        {webhookUrl}
                    </div>
                </div>

                {/* ── Recent Transactions Captured via Bot ─────────────────────── */}
                <div className="glass-card p-6 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" />
                                Riwayat Transaksi via WhatsApp
                            </h3>
                            <p className="text-xs text-slate-400">Transaksi terakhir yang dicatat secara instan oleh AI Bot</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            {recentTransactions.length} Transaksi
                        </span>
                    </div>

                    {recentTransactions.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
                            <MessageSquare size={28} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-bold text-slate-700">Belum Ada Transaksi via WhatsApp</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Coba kirim pesan seperti <i>"Kopi 25rb bca"</i> di WhatsApp Anda untuk mencatat transaksi pertama!
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentTransactions.map((tx) => {
                                const isIncome = tx.type === 'income';
                                return (
                                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                                                isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                                {isIncome ? '↓' : '↑'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                    {tx.merchant_name || tx.description}
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    {formatDate(tx.date)} • {tx.wallet?.name || 'Dompet'} • {tx.category?.name || 'Umum'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-xs font-bold font-mono ${
                                                isIncome ? 'text-emerald-600' : 'text-slate-900'
                                            }`}>
                                                {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </p>
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                WhatsApp AI
                                            </span>
                                        </div>
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
