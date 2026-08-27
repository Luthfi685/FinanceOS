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
     * Auto login as demo user — only runs a DB query if the session
     * is not already authenticated (i.e. once per browser session).
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Auth::check() reads from session (no DB hit). Only query DB when needed.
        if (!Auth::check()) {
            $user = User::where('email', 'demo@financeos.com')->first();

            if ($user) {
                Auth::login($user, remember: true);
            }
        }

        return $next($request);
    }
}
