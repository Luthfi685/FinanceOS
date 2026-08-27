<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'cost',
        'currency',
        'billing_cycle',
        'due_date',
        'next_billing_date',
        'category',
        'icon',
        'color',
        'is_active',
        'auto_record',
    ];

    protected $casts = [
        'cost'              => 'decimal:2',
        'due_date'          => 'date',
        'next_billing_date' => 'date',
        'is_active'         => 'boolean',
        'auto_record'       => 'boolean',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getCycleLabelAttribute(): string
    {
        return match ($this->billing_cycle) {
            'daily'     => 'Harian',
            'weekly'    => 'Mingguan',
            'monthly'   => 'Bulanan',
            'quarterly' => 'Kuartalan',
            'yearly'    => 'Tahunan',
            default     => $this->billing_cycle,
        };
    }

    public function getDaysUntilDueAttribute(): int
    {
        return (int) now()->diffInDays($this->due_date, false);
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date->isPast();
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDueSoon($query, int $days = 7)
    {
        return $query->whereBetween('due_date', [now(), now()->addDays($days)]);
    }
}
