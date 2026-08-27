<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'limit_amount',
        'currency',
        'month',
        'year',
    ];

    protected $casts = [
        'limit_amount' => 'decimal:2',
        'month'        => 'integer',
        'year'         => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    /**
     * Calculate how much of budget has been spent
     */
    public function getSpentAmountAttribute(): float
    {
        return (float) $this->category->transactions()
            ->where('user_id', $this->user_id)
            ->where('type', 'expense')
            ->whereMonth('date', $this->month)
            ->whereYear('date', $this->year)
            ->sum('amount');
    }

    public function getRemainingAttribute(): float
    {
        return max(0, $this->limit_amount - $this->spent_amount);
    }

    public function getPercentageUsedAttribute(): float
    {
        if ($this->limit_amount <= 0) return 0;
        return min(100, ($this->spent_amount / $this->limit_amount) * 100);
    }

    public function getIsOverBudgetAttribute(): bool
    {
        return $this->spent_amount > $this->limit_amount;
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForPeriod($query, int $month, int $year)
    {
        return $query->where('month', $month)->where('year', $year);
    }
}
