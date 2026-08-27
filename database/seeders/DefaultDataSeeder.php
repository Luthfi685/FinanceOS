<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;

class DefaultDataSeeder extends Seeder
{
    /**
     * Default expense categories with icons and colors
     */
    private array $defaultExpenseCategories = [
        ['name' => 'Makanan & Minuman',  'icon' => 'UtensilsCrossed', 'color' => '#F59E0B'],
        ['name' => 'Transportasi',        'icon' => 'Car',             'color' => '#3B82F6'],
        ['name' => 'Belanja',             'icon' => 'ShoppingBag',     'color' => '#8B5CF6'],
        ['name' => 'Tagihan & Utilitas',  'icon' => 'Zap',             'color' => '#EF4444'],
        ['name' => 'Kesehatan',           'icon' => 'HeartPulse',      'color' => '#10B981'],
        ['name' => 'Hiburan',             'icon' => 'Gamepad2',        'color' => '#EC4899'],
        ['name' => 'Pendidikan',          'icon' => 'GraduationCap',   'color' => '#06B6D4'],
        ['name' => 'Investasi',           'icon' => 'TrendingUp',      'color' => '#84CC16'],
        ['name' => 'Lainnya',             'icon' => 'MoreHorizontal',  'color' => '#6B7280'],
    ];

    /**
     * Default income categories
     */
    private array $defaultIncomeCategories = [
        ['name' => 'Gaji',                'icon' => 'Briefcase',       'color' => '#10B981'],
        ['name' => 'Freelance',           'icon' => 'Laptop',          'color' => '#06B6D4'],
        ['name' => 'Investasi',           'icon' => 'TrendingUp',      'color' => '#F59E0B'],
        ['name' => 'Bisnis',              'icon' => 'Building2',       'color' => '#8B5CF6'],
        ['name' => 'Bonus',               'icon' => 'Gift',            'color' => '#EC4899'],
        ['name' => 'Lainnya',             'icon' => 'MoreHorizontal',  'color' => '#6B7280'],
    ];

    public function run(): void
    {
        // Create default categories for all existing users
        User::all()->each(function (User $user) {
            $this->createDefaultCategories($user);
            $this->createDefaultWallet($user);
        });
    }

    public function createDefaultCategories(User $user): void
    {
        // Skip if user already has categories
        if ($user->categories()->exists()) return;

        foreach ($this->defaultExpenseCategories as $cat) {
            Category::create([
                'user_id'    => $user->id,
                'name'       => $cat['name'],
                'type'       => 'expense',
                'icon'       => $cat['icon'],
                'color'      => $cat['color'],
                'is_default' => true,
            ]);
        }

        foreach ($this->defaultIncomeCategories as $cat) {
            Category::create([
                'user_id'    => $user->id,
                'name'       => $cat['name'],
                'type'       => 'income',
                'icon'       => $cat['icon'],
                'color'      => $cat['color'],
                'is_default' => true,
            ]);
        }
    }

    public function createDefaultWallet(User $user): void
    {
        // Skip if user already has wallets
        if ($user->wallets()->exists()) return;

        Wallet::create([
            'user_id'    => $user->id,
            'name'       => 'Dompet Utama',
            'type'       => 'cash',
            'balance'    => 0,
            'currency'   => 'IDR',
            'color'      => '#10B981',
            'icon'       => 'Wallet',
            'is_default' => true,
        ]);
    }
}
