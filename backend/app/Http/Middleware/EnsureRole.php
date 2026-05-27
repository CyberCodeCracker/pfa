<?php

namespace App\Http\Middleware;

use App\Support\Enums\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        foreach ($roles as $role) {
            if ($user->role === Role::from($role)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Accès refusé.'], 403);
    }
}
