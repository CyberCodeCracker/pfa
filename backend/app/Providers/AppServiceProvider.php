<?php

namespace App\Providers;

use App\Domain\Stage\Observers\StageObserver;
use App\Models\Stage;
use App\Domain\Stage\Policies\StagePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Rate limiters
        RateLimiter::for('auth', fn (Request $request) =>
            Limit::perMinute(5)->by($request->ip())->response(function () {
                return response()->json(['message' => 'Trop de tentatives. Veuillez réessayer dans une minute.'], 429);
            })
        );

        RateLimiter::for('api', fn (Request $request) =>
            Limit::perMinute(120)->by($request->user()?->id ?: $request->ip())
        );

        // Observers
        Stage::observe(StageObserver::class);

        // Policies
        Gate::policy(Stage::class, StagePolicy::class);

        // Global password rules
        Password::defaults(fn () => Password::min(10)->mixedCase()->numbers());

        // Force HTTPS in production
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
