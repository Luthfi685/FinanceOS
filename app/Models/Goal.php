<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'daily_target',
        'current_amount',
        'target_date',
        'last_deposit_at',
        'streak_count',
        'icon',
        'color',
        'status',
    ];

    protected $casts = [
        'target_amount'   => 'decimal:2',
        'daily_target'    => 'decimal:2',
        'current_amount'  => 'decimal:2',
        'target_date'     => 'date',
        'last_deposit_at' => 'date',
        'streak_count'    => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getPercentageAttribute(): float
    {
        if ($this->target_amount <= 0) return 0;
        return min(100, round(($this->current_amount / $this->target_amount) * 100, 1));
    }

    public function getRemainingAttribute(): float
    {
        return max(0, (float)$this->target_amount - (float)$this->current_amount);
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->current_amount >= $this->target_amount;
    }

    /**
     * Estimated days remaining if saving at daily_target pace
     */
    public function getDaysRemainingByDailyAttribute(): ?int
    {
        if (!$this->daily_target || $this->daily_target <= 0 || $this->is_completed) {
            return null;
        }
        return (int) ceil($this->remaining / (float)$this->daily_target);
    }

    /**
     * Estimated completion date based on daily savings
     */
    public function getEstimatedCompletionDateAttribute(): ?string
    {
        $days = $this->days_remaining_by_daily;
        if ($days === null) return null;
        return Carbon::now()->addDays($days)->translatedFormat('d F Y');
    }

    /**
     * Calculate missed days since creation or last deposit
     */
    public function getMissedDaysAttribute(): int
    {
        if (!$this->daily_target || $this->daily_target <= 0 || $this->is_completed) {
            return 0;
        }

        $now = Carbon::now()->startOfDay();
        $refDate = $this->last_deposit_at
            ? Carbon::parse($this->last_deposit_at)->startOfDay()
            : Carbon::parse($this->created_at)->startOfDay();

        $diffInDays = (int) $refDate->diffInDays($now);

        // If today not deposited yet, and it's been more than 0 days since last reference
        if ($this->last_deposit_at && Carbon::parse($this->last_deposit_at)->isToday()) {
            return 0;
        }

        return max(0, $diffInDays);
    }

    public function getIsDepositedTodayAttribute(): bool
    {
        return $this->last_deposit_at ? Carbon::parse($this->last_deposit_at)->isToday() : false;
    }
}
