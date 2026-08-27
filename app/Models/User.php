<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'default_currency',
        'preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'preferences'       => 'array',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function wallets(): HasMany
    {
        return $this->hasMany(Wallet::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    public function recurringSubscriptions(): HasMany
    {
        return $this->hasMany(RecurringSubscription::class);
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    // ─── Computed ─────────────────────────────────────────────────────────────

    /**
     * Total balance across all wallets
     */
    public function getTotalBalanceAttribute(): float
    {
        return (float) $this->wallets()->sum('balance');
    }

    /**
     * Monthly income for given month/year
     */
    public function getMonthlyIncome(int $month, int $year): float
    {
        return (float) $this->transactions()
            ->where('type', 'income')
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->sum('amount');
    }

    /**
     * Monthly expense for given month/year
     */
    public function getMonthlyExpense(int $month, int $year): float
    {
        return (float) $this->transactions()
            ->where('type', 'expense')
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->sum('amount');
    }
}
