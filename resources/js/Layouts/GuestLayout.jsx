import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-obsidian text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 text-center"
            >
                <Link href="/" className="inline-flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald/15 border border-emerald/30 flex items-center justify-center shadow-emerald-sm">
                        <TrendingUp size={24} className="text-emerald" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-2xl font-display font-extrabold tracking-tight text-white">
                            Finance<span className="text-gradient-emerald">OS</span>
                        </h1>
                        <p className="text-xs text-muted">Wealth Operating System</p>
                    </div>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full sm:max-w-md glass-card rounded-3xl p-8 shadow-2xl border border-surface-border relative z-10"
            >
                {children}
            </motion.div>

            <div className="mt-8 text-center text-xs text-muted flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald" />
                <span>Bank-grade Encryption & Privacy Isolation</span>
            </div>
        </div>
    );
}
