<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sanctum SPA: make auth routes stateful (cookie-based)
        $middleware->statefulApi();

        // CORS — allow frontend origin with credentials
        $middleware->validateCsrfTokens(except: [
            'sanctum/csrf-cookie',
        ]);

        // Register route-level middleware aliases
        $middleware->alias([
            'role'                  => \App\Http\Middleware\EnsureRole::class,
            'force.password.change' => \App\Http\Middleware\ForcePasswordChange::class,
            'security.headers'      => \App\Http\Middleware\SecurityHeaders::class,
        ]);

        // CORS headers (must be prepended so it runs before other middleware)
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);

        // Append security headers to all responses
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Trust all proxies (behind nginx)
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Accès refusé.'], 403);
            }
        });
    })->create();
