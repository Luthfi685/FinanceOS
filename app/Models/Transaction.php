<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'amount',
        'type',
        'description',
        'merchant_name',
        'date',
        'currency',
        'is_ai_generated',
        'ai_metadata',
        'receipt_path',
    ];

    protected $casts = [
        'amount'         => 'decimal:2',
        'date'           => 'date',
        'is_ai_generated'=> 'boolean',
        'ai_metadata'    => 'array',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getFormattedAmountAttribute(): string
    {
        $prefix = $this->type === 'income' ? '+' : '-';
        return $prefix . $this->currency . ' ' . number_format($this->amount, 2, ',', '.');
    }

    public function getIsPositiveAttribute(): bool
    {
        return $this->type === 'income';
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForMonth($query, int $month, int $year)
    {
        return $query->whereMonth('date', $month)->whereYear('date', $year);
    }

    public function scopeLastDays($query, int $days)
    {
        return $query->where('date', '>=', now()->subDays($days)->toDateString());
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
