<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Category $category): bool
    {
        return $user->id === $category->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Category $category): bool
    {
        // Cannot modify default categories
        if ($category->is_default) return false;
        return $user->id === $category->user_id;
    }

    public function delete(User $user, Category $category): bool
    {
        if ($category->is_default) return false;
        return $user->id === $category->user_id;
    }
}
