<?php

namespace App\Observers;

use App\Models\User;
use Database\Seeders\DefaultDataSeeder;

class UserObserver
{
    /**
     * Auto-create default categories & wallet when a new user registers
     */
    public function created(User $user): void
    {
        $seeder = new DefaultDataSeeder();
        $seeder->createDefaultCategories($user);
        $seeder->createDefaultWallet($user);
    }
}
