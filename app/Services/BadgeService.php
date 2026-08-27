<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserBadge;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BadgeService
{
    /**
     * All badge definitions.
     */
    private array $definitions = [
        // ── Streak Badges ─────────────────────────────────────────────────────
        'streak_3' => [
            'name'        => '3-Day Streak',
            'emoji'       => '🔥',
            'description' => 'Nabung 3 hari berturut-turut tanpa jeda!',
            'category'    => 'streak',
            'level'       => 'bronze',
            'xp'          => 30,
        ],
        'streak_7' => [
            'name'        => 'Streak Master',
            'emoji'       => '🔥🔥',
            'description' => 'Nabung 7 hari berturut-turut! Konsisten banget!',
            'category'    => 'streak',
            'level'       => 'silver',
            'xp'          => 100,
        ],
        'streak_30' => [
            'name'        => '1-Month Legend',
            'emoji'       => '🏆',
            'description' => 'Nabung 30 hari full tanpa bolong. Luar biasa!',
            'category'    => 'streak',
            'level'       => 'gold',
            'xp'          => 500,
        ],

        // ── Wealth Badges ─────────────────────────────────────────────────────
        'first_100k' => [
            'name'        => 'First 100K',
            'emoji'       => '💵',
            'description' => 'Total saldo kamu melewati Rp 100.000. Awal yang bagus!',
            'category'    => 'wealth',
            'level'       => 'bronze',
            'xp'          => 25,
        ],
        'first_million' => [
            'name'        => 'Millionaire Club',
            'emoji'       => '💎',
            'description' => 'Total aset kamu melewati Rp 1.000.000!',
            'category'    => 'wealth',
            'level'       => 'silver',
            'xp'          => 150,
        ],
        'first_10m' => [
            'name'        => 'Wealth Builder',
            'emoji'       => '👑',
            'description' => 'Total aset kamu melewati Rp 10.000.000! Asyik!',
            'category'    => 'wealth',
            'level'       => 'gold',
            'xp'          => 500,
        ],

        // ── Discipline Badges ─────────────────────────────────────────────────
        'first_budget' => [
            'name'        => 'Budget Planner',
            'emoji'       => '📊',
            'description' => 'Membuat anggaran pertamamu. Langkah awal menuju kontrol finansial!',
            'category'    => 'discipline',
            'level'       => 'bronze',
            'xp'          => 30,
        ],
        'budget_discipline' => [
            'name'        => 'Budget Discipline',
            'emoji'       => '🛡️',
            'description' => 'Berhasil menjaga semua anggaran bulan ini agar tidak melebihi batas!',
            'category'    => 'discipline',
            'level'       => 'silver',
            'xp'          => 200,
        ],
        'no_overspend' => [
            'name'        => 'Zen Spender',
            'emoji'       => '🧘',
            'description' => '10 transaksi berturut-turut semuanya dalam batas anggaran. Mantap!',
            'category'    => 'discipline',
            'level'       => 'gold',
            'xp'          => 300,
        ],

        // ── Achievement Badges ────────────────────────────────────────────────
        'first_transaction' => [
            'name'        => 'First Log',
            'emoji'       => '📝',
            'description' => 'Mencatat transaksi pertamamu. Selamat bergabung di FinanceOS!',
            'category'    => 'achievement',
            'level'       => 'bronze',
            'xp'          => 10,
        ],
        'first_goal' => [
            'name'        => 'Dreamer',
            'emoji'       => '🎯',
            'description' => 'Membuat target impian pertamamu. Mulai dari sini!',
            'category'    => 'achievement',
            'level'       => 'bronze',
            'xp'          => 20,
        ],
        'goal_completed' => [
            'name'        => 'Dream Conqueror',
            'emoji'       => '🏅',
            'description' => 'Berhasil mencapai 100% target impian! AMAZING!',
            'category'    => 'achievement',
            'level'       => 'gold',
            'xp'          => 1000,
        ],
        'ai_user' => [
            'name'        => 'Cyberpunk AI',
            'emoji'       => '🤖',
            'description' => 'Kamu adalah pengguna setia fitur AI Copilot FinanceOS!',
            'category'    => 'achievement',
            'level'       => 'silver',
            'xp'          => 80,
        ],
        'five_wallets' => [
            'name'        => 'Portfolio Builder',
            'emoji'       => '💼',
            'description' => 'Mengelola 5 dompet/rekening sekaligus. Pro banget!',
            'category'    => 'achievement',
            'level'       => 'silver',
            'xp'          => 100,
        ],
    ];

    /**
     * Evaluate and award all applicable badges for a user.
     * Returns array of newly awarded badges.
     */
    public function evaluate(User $user): array
    {
        $awarded = [];
        $now = Carbon::now();

        $totalBalance = (float) $user->wallets()->sum('balance');
        $txCount      = $user->transactions()->count();
        $goalCount    = $user->goals()->count();
        $budgetCount  = $user->budgets()->count();
        $walletCount  = $user->wallets()->count();
        $aiTxCount    = $user->transactions()->where('is_ai_generated', true)->count();

        // Longest deposit streak (check goals table streak_count)
        $maxStreak = (int) $user->goals()->max('streak_count');

        // Budget discipline: all budgets this month under limit
        $now_m = $now->month; $now_y = $now->year;
        $budgetsThisMonth = $user->budgets()->where('month', $now_m)->where('year', $now_y)->get();
        $allUnderBudget   = $budgetsThisMonth->count() > 0 && $budgetsThisMonth->every(fn($b) => !$b->is_over_budget);

        // Goal completed
        $hasCompletedGoal = $user->goals()
            ->where('target_amount', '>', 0)
            ->whereColumn('current_amount', '>=', 'target_amount')
            ->exists();

        // No overspend: check last 10 expense transactions are all within their category budget
        $last10Expenses = $user->transactions()
            ->with('category')
            ->where('type', 'expense')
            ->latest('date')
            ->limit(10)
            ->get();
        $noOverspend = $last10Expenses->count() >= 10 && $last10Expenses->every(function ($tx) use ($user, $now_m, $now_y) {
            if (!$tx->category_id) return true;
            $budget = $user->budgets()
                ->where('category_id', $tx->category_id)
                ->where('month', Carbon::parse($tx->date)->month)
                ->where('year', Carbon::parse($tx->date)->year)
                ->first();
            if (!$budget) return true; // No budget set = not overspent
            return !$budget->is_over_budget;
        });

        // Streak badge candidates
        $checkBadges = [
            'first_transaction' => $txCount >= 1,
            'first_goal'        => $goalCount >= 1,
            'first_budget'      => $budgetCount >= 1,
            'first_100k'        => $totalBalance >= 100_000,
            'first_million'     => $totalBalance >= 1_000_000,
            'first_10m'         => $totalBalance >= 10_000_000,
            'streak_3'          => $maxStreak >= 3,
            'streak_7'          => $maxStreak >= 7,
            'streak_30'         => $maxStreak >= 30,
            'budget_discipline' => $allUnderBudget,
            'goal_completed'    => $hasCompletedGoal,
            'ai_user'           => $aiTxCount >= 5,
            'five_wallets'      => $walletCount >= 5,
            'no_overspend'      => $noOverspend,
        ];

        foreach ($checkBadges as $key => $qualified) {
            if (!$qualified) continue;
            if (!isset($this->definitions[$key])) continue;

            $alreadyEarned = UserBadge::where('user_id', $user->id)->where('badge_key', $key)->exists();
            if ($alreadyEarned) continue;

            $def = $this->definitions[$key];
            $badge = UserBadge::create([
                'user_id'     => $user->id,
                'badge_key'   => $key,
                'badge_name'  => $def['name'],
                'emoji'       => $def['emoji'],
                'description' => $def['description'],
                'category'    => $def['category'],
                'level'       => $def['level'],
                'xp_reward'   => $def['xp'],
                'earned_at'   => $now,
            ]);
            $awarded[] = $badge;
        }

        return $awarded;
    }

    /**
     * Calculate total XP for a user.
     */
    public function getTotalXp(User $user): int
    {
        return (int) UserBadge::where('user_id', $user->id)->sum('xp_reward');
    }

    /**
     * Get user's level info based on XP.
     */
    public function getLevelInfo(int $xp): array
    {
        $levels = [
            ['min' => 0,    'max' => 99,    'level' => 1, 'title' => 'Novice Saver',          'emoji' => '🌱'],
            ['min' => 100,  'max' => 299,   'level' => 2, 'title' => 'Budget Explorer',        'emoji' => '🗺️'],
            ['min' => 300,  'max' => 599,   'level' => 3, 'title' => 'Cashflow Warrior',       'emoji' => '⚔️'],
            ['min' => 600,  'max' => 999,   'level' => 4, 'title' => 'Savings Strategist',     'emoji' => '🎯'],
            ['min' => 1000, 'max' => 1999,  'level' => 5, 'title' => 'Financial Guardian',     'emoji' => '🛡️'],
            ['min' => 2000, 'max' => 3999,  'level' => 6, 'title' => 'Wealth Architect',       'emoji' => '🏗️'],
            ['min' => 4000, 'max' => 7999,  'level' => 7, 'title' => 'Investment Sage',        'emoji' => '🧙'],
            ['min' => 8000, 'max' => 99999, 'level' => 8, 'title' => 'Wealth Titan',           'emoji' => '👑'],
        ];

        foreach ($levels as $l) {
            if ($xp >= $l['min'] && $xp <= $l['max']) {
                $progress = $l['max'] === 99999 ? 100 : round((($xp - $l['min']) / ($l['max'] - $l['min'])) * 100);
                return array_merge($l, ['xp' => $xp, 'progress' => $progress]);
            }
        }

        return ['level' => 1, 'title' => 'Novice Saver', 'emoji' => '🌱', 'xp' => $xp, 'progress' => 0];
    }

    /**
     * Return all badge definitions (for showing locked badges).
     */
    public function allDefinitions(): array
    {
        return $this->definitions;
    }
}
