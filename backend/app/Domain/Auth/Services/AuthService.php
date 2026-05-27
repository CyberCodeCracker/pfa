<?php

namespace App\Domain\Auth\Services;

use App\Models\User;
use App\Support\Enums\Role;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(string $email, string $password, bool $remember = false): User
    {
        if (!Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d\'identification sont incorrectes.'],
            ]);
        }

        $user = Auth::user();
        $user->update(['last_login_at' => now()]);

        return $user;
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update([
            'password'             => Hash::make($newPassword),
            'must_change_password' => false,
        ]);
    }

    public function forceChangePassword(User $user, string $newPassword): void
    {
        $user->update([
            'password'             => Hash::make($newPassword),
            'must_change_password' => false,
        ]);
    }
}
