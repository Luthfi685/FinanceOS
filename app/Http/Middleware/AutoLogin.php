<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AutoLogin
{
    /**
     * Anonymous Guest Session:
     * Creates a unique isolated workspace for every new browser/device seamlessly
     * without requiring any login or registration.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            return $next($request);
        }

        // 1. Check existing guest token from cookie or session
        $guestToken = $request->cookie('financeos_guest_token') ?? session('financeos_guest_token');

        $user = null;
        if ($guestToken) {
            $user = User::where('email', "guest_{$guestToken}@financeos.internal")->first();
        }

        // 2. If new visitor, create a brand new private user account
        if (!$user) {
            $newToken = Str::random(16);
            $user = User::create([
                'name'              => 'Pengguna',
                'email'             => "guest_{$newToken}@financeos.internal",
                'password'          => Hash::make(Str::random(32)),
                'default_currency'  => 'IDR',
                'email_verified_at' => now(),
            ]);

            session(['financeos_guest_token' => $newToken]);
            Cookie::queue('financeos_guest_token', $newToken, 60 * 24 * 365); // Remember for 1 year
        }

        // 3. Log in automatically into their own isolated workspace
        Auth::login($user, remember: true);

        return $next($request);
    }
}
