<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Wallet extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'balance',
        'currency',
        'color',
        'icon',
        'is_default',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'is_default' => 'boolean',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    /**
     * Get wallet type label in Indonesian
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'bank'     => 'Rekening Bank',
            'e-wallet' => 'E-Wallet',
            'crypto'   => 'Crypto',
            'cash'     => 'Tunai',
            default    => 'Lainnya',
        };
    }

    /**
     * Get formatted balance with currency symbol
     */
    public function getFormattedBalanceAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->balance, 2, ',', '.');
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
