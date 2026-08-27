<?php

namespace App\Policies;

use App\Models\RecurringSubscription;
use App\Models\User;

class RecurringSubscriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, RecurringSubscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, RecurringSubscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    public function delete(User $user, RecurringSubscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }
}
