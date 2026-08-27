import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, Sparkles, X, Check,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ScanReceiptModal({ isOpen, onClose, wallets = [], categories = [] }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scannedResult, setScannedResult] = useState(null);
    const fileInputRef = useRef(null);

    const [txData, setTxData] = useState({
        wallet_id: wallets[0]?.id ?? '',
        category_id: '',
        amount: '',
        type: 'expense',
        merchant_name: '',
        description: 'Auto-scan struk via Gemini AI',
        date: new Date().toISOString().split('T')[0],
        currency: 'IDR',
    });

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setScannedResult(null);
    }

    async function handleScan() {
        if (!selectedFile) {
            toast.error('Pilih foto struk terlebih dahulu.');
            return;
        }

        setScanning(true);
        const formData = new FormData();
        formData.append('receipt', selectedFile);

        try {
            const res = await axios.post('/ai/scan-receipt', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success && res.data.data) {
                const parsed = res.data.data;
                setScannedResult(parsed);
                setTxData({
                    wallet_id: parsed.default_wallet_id || wallets[0]?.id || '',
                    category_id: parsed.matched_category_id || categories[0]?.id || '',
                    amount: parsed.total_amount || 0,
                    type: 'expense',
                    merchant_name: parsed.merchant_name || 'Struk Belanja',
                    description: `Pindai Gemini OCR: ${parsed.items?.map(i => i.name).join(', ') || 'Item Belanja'}`,
                    date: parsed.date || new Date().toISOString().split('T')[0],
                    currency: parsed.currency || 'IDR',
                });
                toast.success('Struk berhasil dipindai!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memindai struk. Pastikan GEMINI_API_KEY aktif.');
        } finally {
            setScanning(false);
        }
    }

    function handleSaveTransaction(e) {
        e.preventDefault();
        router.post('/transactions', txData, {
            onSuccess: () => {
                toast.success('Transaksi dari struk berhasil disimpan!');
                handleReset();
                onClose();
            },
            onError: () => toast.error('Gagal menyimpan transaksi.'),
        });
    }

    function handleReset() {
        setSelectedFile(null);
        setPreviewUrl(null);
        setScannedResult(null);
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
                        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-display font-bold text-slate-900">Pindai Struk Belanja</h3>
                                        <p className="text-[11px] text-slate-400">Gemini 1.5 Flash Vision Multimodal OCR</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                                    <X size={18} />
                                </button>
                            </div>

                            {!scannedResult ? (
                                <div className="space-y-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                                            previewUrl ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-400 bg-slate-50/50'
                                        }`}
                                    >
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                                        {previewUrl ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <img src={previewUrl} alt="Preview" className="max-h-52 rounded-xl object-contain shadow-sm border border-slate-200" />
                                                <p className="text-xs text-emerald-600 font-semibold mt-1">Klik untuk mengganti gambar</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 py-4">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                                                    <Camera size={22} />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-800">Upload atau Drop Foto Struk / Nota</p>
                                                <p className="text-xs text-slate-400">Mendukung JPG, PNG, WEBP</p>
                                            </div>
                                        )}
                                    </div>

                                    {previewUrl && (
                                        <button
                                            onClick={handleScan}
                                            disabled={scanning}
                                            className="w-full btn-gold py-2.5 justify-center text-xs font-bold"
                                        >
                                            {scanning ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 size={16} className="animate-spin" /> Sedang menganalisis struk...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Sparkles size={16} /> Ekstrak Data Transaksi
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSaveTransaction} className="space-y-4">
                                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                                            <Check size={16} /> Data Struk Berhasil Diekstrak
                                        </div>
                                        <button type="button" onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-900 underline">
                                            Scan Ulang
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="label-luxury">Nama Toko / Merchant</label>
                                            <input type="text" value={txData.merchant_name} onChange={e => setTxData({...txData, merchant_name: e.target.value})} className="input-luxury" required />
                                        </div>
                                        <div>
                                            <label className="label-luxury">Total Tagihan (Rp)</label>
                                            <input type="number" step="any" value={txData.amount} onChange={e => setTxData({...txData, amount: e.target.value})} className="input-luxury font-mono font-bold text-emerald-600" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="label-luxury">Dompet Pembayaran</label>
                                            <select value={txData.wallet_id} onChange={e => setTxData({...txData, wallet_id: e.target.value})} className="select-luxury">
                                                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-luxury">Kategori</label>
                                            <select value={txData.category_id} onChange={e => setTxData({...txData, category_id: e.target.value})} className="select-luxury">
                                                {categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="label-luxury">Tanggal</label>
                                            <input type="date" value={txData.date} onChange={e => setTxData({...txData, date: e.target.value})} className="input-luxury" required />
                                        </div>
                                        <div>
                                            <label className="label-luxury">Catatan Item</label>
                                            <input type="text" value={txData.description} onChange={e => setTxData({...txData, description: e.target.value})} className="input-luxury" />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-3">
                                        <button type="button" onClick={onClose} className="btn-ghost flex-1">Tutup</button>
                                        <button type="submit" className="btn-primary flex-1 justify-center">
                                            <Check size={16} /> Simpan Transaksi
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
