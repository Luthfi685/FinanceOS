<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AutoLogin
{
    /**
     * Auto login as demo user — seamlessly logs in without requiring credentials
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            $user = User::firstOrCreate(
                ['email' => 'user@financeos.com'],
                [
                    'name' => 'Pengguna',
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'default_currency' => 'IDR',
                    'email_verified_at' => now(),
                ]
            );

            Auth::login($user, remember: true);
        }

        return $next($request);
    }
}
