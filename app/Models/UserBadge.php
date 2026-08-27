<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBadge extends Model
{
    protected $fillable = [
        'user_id', 'badge_key', 'badge_name', 'emoji',
        'description', 'category', 'level', 'xp_reward', 'earned_at',
    ];

    protected $casts = [
        'earned_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
