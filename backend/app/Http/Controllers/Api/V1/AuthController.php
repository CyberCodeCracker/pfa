<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Auth\Services\AuthService;
use App\Domain\Auth\Services\InvitationService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private InvitationService $invitationService,
    ) {}

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        $user = $this->authService->login(
            $validated['email'],
            $validated['password'],
            $validated['remember'] ?? false,
        );

        $request->session()->regenerate();

        if ($user->isEnseignant()) {
            $user->load('enseignantProfile.etablissements');
        }

        return response()->json(['data' => new UserResource($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout();

        return response()->json(null, 204);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->isEnseignant()) {
            $user->load('enseignantProfile.etablissements');
        }
        return response()->json(['data' => new UserResource($user)]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', PasswordRule::min(10)->mixedCase()->numbers(), 'confirmed'],
        ]);

        $this->authService->changePassword(
            $request->user(),
            $validated['current_password'],
            $validated['new_password'],
        );

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    public function acceptInvitation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token'        => ['required', 'string'],
            'new_password' => ['required', 'string', PasswordRule::min(10)->mixedCase()->numbers(), 'confirmed'],
        ]);

        $user = $this->invitationService->acceptInvitation(
            $validated['token'],
            $validated['new_password'],
        );

        // Log in the user after accepting invitation
        auth()->login($user);
        $request->session()->regenerate();

        return response()->json(['data' => new UserResource($user)]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::sendResetLink($request->only('email'));

        return response()->json(['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token'    => ['required'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'string', PasswordRule::min(10)->mixedCase()->numbers(), 'confirmed'],
        ]);

        $status = Password::reset($validated, function ($user, $password) {
            $user->forceFill(['password' => $password, 'must_change_password' => false])->save();
        });

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 422);
        }

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}
