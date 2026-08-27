<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or get Demo User
        $user = User::updateOrCreate(
            ['email' => 'demo@financeos.com'],
            [
                'name' => 'Alexander Vance',
                'password' => Hash::make('password'),
                'default_currency' => 'IDR',
                'email_verified_at' => now(),
            ]
        );

        // 2. Default categories and wallets are automatically created by UserObserver.
        // Let's create multiple luxury wallets
        $bca = Wallet::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'BCA Platinum'],
            [
                'type' => 'bank',
                'balance' => 85500000,
                'currency' => 'IDR',
                'color' => '#3B82F6',
                'is_default' => true,
            ]
        );

        $crypto = Wallet::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Crypto Vault (Binance)'],
            [
                'type' => 'crypto',
                'balance' => 45200000,
                'currency' => 'IDR',
                'color' => '#F59E0B',
            ]
        );

        $gopay = Wallet::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'GoPay & Lifestyle'],
            [
                'type' => 'e-wallet',
                'balance' => 4850000,
                'currency' => 'IDR',
                'color' => '#10B981',
            ]
        );

        $cash = Wallet::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Brankas Tunai'],
            [
                'type' => 'cash',
                'balance' => 15000000,
                'currency' => 'IDR',
                'color' => '#8B5CF6',
            ]
        );

        // Fetch categories
        $categories = $user->categories()->get()->keyBy('name');

        // 3. Create Sample Budgets for this month
        $now = Carbon::now();
        if (isset($categories['Makanan & Minuman'])) {
            Budget::updateOrCreate(
                ['user_id' => $user->id, 'category_id' => $categories['Makanan & Minuman']->id, 'month' => $now->month, 'year' => $now->year],
                ['limit_amount' => 5000000, 'currency' => 'IDR']
            );
        }
        if (isset($categories['Belanja'])) {
            Budget::updateOrCreate(
                ['user_id' => $user->id, 'category_id' => $categories['Belanja']->id, 'month' => $now->month, 'year' => $now->year],
                ['limit_amount' => 7500000, 'currency' => 'IDR']
            );
        }
        if (isset($categories['Transportasi'])) {
            Budget::updateOrCreate(
                ['user_id' => $user->id, 'category_id' => $categories['Transportasi']->id, 'month' => $now->month, 'year' => $now->year],
                ['limit_amount' => 3000000, 'currency' => 'IDR']
            );
        }
        if (isset($categories['Tagihan & Utilitas'])) {
            Budget::updateOrCreate(
                ['user_id' => $user->id, 'category_id' => $categories['Tagihan & Utilitas']->id, 'month' => $now->month, 'year' => $now->year],
                ['limit_amount' => 4000000, 'currency' => 'IDR']
            );
        }

        // 4. Create Sample Transactions (Past 4 months for rich chart data)
        // Income
        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $bca->id,
            'category_id' => $categories['Gaji']->id ?? null,
            'amount' => 45000000,
            'type' => 'income',
            'merchant_name' => 'PT Astra Tech Group (Gaji Pokok)',
            'description' => 'Gaji bulanan Senior Executive',
            'date' => $now->copy()->subDays(2)->toDateString(),
            'currency' => 'IDR',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $crypto->id,
            'category_id' => $categories['Investasi']->id ?? null,
            'amount' => 12500000,
            'type' => 'income',
            'merchant_name' => 'Binance Staking & Dividen',
            'description' => 'Profit yield ETH staking',
            'date' => $now->copy()->subDays(5)->toDateString(),
            'currency' => 'IDR',
        ]);

        // Expenses
        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $bca->id,
            'category_id' => $categories['Belanja']->id ?? null,
            'amount' => 3250000,
            'type' => 'expense',
            'merchant_name' => 'Apple Store / iBox',
            'description' => 'Magic Keyboard & Magic Trackpad',
            'date' => $now->copy()->subDays(1)->toDateString(),
            'currency' => 'IDR',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $gopay->id,
            'category_id' => $categories['Makanan & Minuman']->id ?? null,
            'amount' => 485000,
            'type' => 'expense',
            'merchant_name' => 'Starbucks Reserve Senopati',
            'description' => 'Client meeting coffee & brunch',
            'date' => $now->copy()->subDays(3)->toDateString(),
            'currency' => 'IDR',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $bca->id,
            'category_id' => $categories['Tagihan & Utilitas']->id ?? null,
            'amount' => 1750000,
            'type' => 'expense',
            'merchant_name' => 'PLN & MyRepublic Fiber',
            'description' => 'Listrik apartemen & Internet 500Mbps',
            'date' => $now->copy()->subDays(6)->toDateString(),
            'currency' => 'IDR',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $gopay->id,
            'category_id' => $categories['Transportasi']->id ?? null,
            'amount' => 320000,
            'type' => 'expense',
            'merchant_name' => 'GrabCar Premium',
            'description' => 'Bandara Soetta ke Sudirman',
            'date' => $now->copy()->subDays(7)->toDateString(),
            'currency' => 'IDR',
        ]);

        // Historical months for smooth cash flow charts
        for ($i = 1; $i <= 5; $i++) {
            $pastDate = $now->copy()->subMonths($i);
            
            Transaction::create([
                'user_id' => $user->id,
                'wallet_id' => $bca->id,
                'category_id' => $categories['Gaji']->id ?? null,
                'amount' => 42000000 + ($i * 1000000),
                'type' => 'income',
                'merchant_name' => 'Gaji Bulanan',
                'description' => 'Gaji bulan ' . $pastDate->translatedFormat('F'),
                'date' => $pastDate->copy()->startOfMonth()->addDays(24)->toDateString(),
                'currency' => 'IDR',
            ]);

            Transaction::create([
                'user_id' => $user->id,
                'wallet_id' => $bca->id,
                'category_id' => $categories['Belanja']->id ?? null,
                'amount' => 14000000 + ($i * 500000),
                'type' => 'expense',
                'merchant_name' => 'Living & Lifestyle Expenses',
                'description' => 'Total pengeluaran bulan ' . $pastDate->translatedFormat('F'),
                'date' => $pastDate->copy()->startOfMonth()->addDays(15)->toDateString(),
                'currency' => 'IDR',
            ]);
        }
    }
}
