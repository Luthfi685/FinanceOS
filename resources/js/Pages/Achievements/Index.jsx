import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Trophy, Star, Lock, Flame, Zap, Shield,
    Award, Gem, ShieldCheck, CheckCircle2, TrendingUp,
    Target, BookOpen, Crown, Cpu, Briefcase, DollarSign
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const LEVEL_COLORS = {
    bronze:  { bg: 'bg-amber-50/70',   border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-800' },
    silver:  { bg: 'bg-slate-50',      border: 'border-slate-300',  text: 'text-slate-600',  badge: 'bg-slate-100 text-slate-700' },
    gold:    { bg: 'bg-yellow-50/80',  border: 'border-yellow-300', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800' },
    diamond: { bg: 'bg-blue-50/70',    border: 'border-blue-300',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800' },
};

const CATEGORY_CONFIG = {
    streak:      { label: 'Konsistensi',  icon: Flame,       color: 'bg-orange-50 text-orange-700 border-orange-200' },
    wealth:      { label: 'Kekayaan',     icon: Gem,         color: 'bg-blue-50 text-blue-700 border-blue-200' },
    discipline:  { label: 'Disiplin',     icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    achievement: { label: 'Pencapaian',   icon: Award,       color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

function getBadgeIcon(badgeKey, category) {
    switch (badgeKey) {
        case 'streak_3':
        case 'streak_7':
        case 'streak_30':
            return Flame;
        case 'first_100k':
        case 'first_million':
        case 'first_10m':
            return Gem;
        case 'first_budget':
        case 'budget_discipline':
        case 'no_overspend':
            return ShieldCheck;
        case 'first_transaction':
            return BookOpen;
        case 'first_goal':
            return Target;
        case 'goal_completed':
            return Trophy;
        case 'ai_user':
            return Cpu;
        case 'five_wallets':
            return Briefcase;
        default:
            return CATEGORY_CONFIG[category]?.icon || Award;
    }
}

function XPBar({ levelInfo }) {
    return (
        <div className="glass-card p-6 bg-white border border-slate-200 mb-6">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Crown size={28} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-end justify-between mb-1.5">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Level {levelInfo.level}</p>
                            <h3 className="text-lg font-bold font-display text-slate-900">{levelInfo.title}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 font-medium">Total Skor</p>
                            <p className="text-2xl font-bold font-mono text-emerald-600">
                                {levelInfo.xp} <span className="text-xs font-sans text-slate-400">XP</span>
                            </p>
                        </div>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${levelInfo.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">{levelInfo.progress}% menuju level berikutnya</p>
                </div>
            </div>
        </div>
    );
}

function BadgeCard({ badge, earned = true }) {
    const levelStyle = LEVEL_COLORS[badge.level] || LEVEL_COLORS.bronze;
    const catConfig = CATEGORY_CONFIG[badge.category] || { icon: Award, label: badge.category, color: 'bg-slate-50 text-slate-600 border-slate-200' };
    const CatIcon = catConfig.icon;
    const BadgeIconComponent = getBadgeIcon(badge.badge_key, badge.category);

    return (
        <motion.div
            whileHover={earned ? { y: -3, scale: 1.02 } : {}}
            className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                earned
                    ? `${levelStyle.bg} ${levelStyle.border} shadow-xs hover:shadow-md`
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
            }`}
        >
            {!earned && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-100/50 backdrop-blur-[1px] z-10">
                    <div className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                        <Lock size={16} />
                    </div>
                </div>
            )}

            <div className="text-center">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-xs bg-white border border-slate-200/80">
                    <BadgeIconComponent size={24} className={earned ? (badge.level === 'gold' ? 'text-amber-500' : badge.level === 'diamond' ? 'text-blue-600' : 'text-slate-700') : 'text-slate-400'} />
                </div>
                <h4 className={`text-xs font-bold mb-1.5 ${earned ? 'text-slate-900' : 'text-slate-400'}`}>
                    {badge.badge_name}
                </h4>
                <p className={`text-[11px] mb-3 leading-relaxed ${earned ? 'text-slate-600' : 'text-slate-400'}`}>
                    {badge.description}
                </p>
            </div>

            <div>
                <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/60">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${catConfig.color}`}>
                        <CatIcon size={11} /> {catConfig.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${levelStyle.badge}`}>
                        <Zap size={10} className="mr-0.5 text-amber-600" />+{badge.xp_reward} XP
                    </span>
                </div>

                {earned && badge.earned_at && (
                    <p className="text-[10px] text-slate-400 text-center mt-2.5 font-medium">Diperoleh {badge.earned_at}</p>
                )}
            </div>
        </motion.div>
    );
}

export default function AchievementsIndex({
    earnedBadges,
    lockedBadges,
    newlyAwarded,
    totalXp,
    levelInfo,
    badgeCount,
    totalPossible,
}) {
    const categories = ['streak', 'wealth', 'discipline', 'achievement'];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                            Pencapaian & Medali
                        </h2>
                        <p className="text-xs text-slate-500">
                            Kumpulkan seluruh medali dan tingkatkan level kedisiplinan keuangan Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                            <Trophy size={14} className="text-emerald-600" /> {badgeCount} / {totalPossible} Medali
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Pencapaian — FinanceOS" />

            {/* Newly Awarded Banner */}
            {newlyAwarded?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                            <Trophy size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900">Selamat! Anda memperoleh medali baru:</p>
                            <p className="text-xs text-amber-700 font-medium">{newlyAwarded.join(', ')}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* XP & Level Bar */}
            <XPBar levelInfo={levelInfo} />

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {categories.map(cat => {
                    const catConfig = CATEGORY_CONFIG[cat];
                    const IconComponent = catConfig.icon;
                    const count = earnedBadges.filter(b => b.category === cat).length;
                    const total = [...earnedBadges, ...lockedBadges].filter(b => b.category === cat).length;
                    return (
                        <div key={cat} className="glass-card p-4 bg-white border border-slate-200 text-center">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
                                <IconComponent size={16} />
                            </div>
                            <p className="text-xs font-bold text-slate-700">{catConfig.label}</p>
                            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">{count}<span className="text-xs text-slate-400">/{total}</span></p>
                        </div>
                    );
                })}
            </div>

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Trophy size={16} className="text-amber-500" /> Medali yang Diperoleh ({earnedBadges.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {earnedBadges.map((badge, i) => (
                            <motion.div
                                key={badge.badge_key}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <BadgeCard badge={badge} earned={true} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                        <Lock size={15} className="text-slate-400" /> Medali Belum Terbuka ({lockedBadges.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {lockedBadges.map((badge, i) => (
                            <motion.div
                                key={badge.badge_key}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                            >
                                <BadgeCard badge={badge} earned={false} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {earnedBadges.length === 0 && (
                <div className="glass-card bg-white p-12 text-center border border-slate-200 mt-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Award size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Belum Ada Medali</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Mulailah mencatat transaksi, menetapkan target tabungan, dan mengatur anggaran untuk mendapatkan medali pertama Anda.
                    </p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
