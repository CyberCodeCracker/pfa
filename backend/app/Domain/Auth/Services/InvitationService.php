<?php

namespace App\Domain\Auth\Services;

use App\Domain\Auth\Notifications\InvitationNotification;
use App\Models\Affectation;
use App\Models\EtudiantProfile;
use App\Models\User;
use App\Support\Enums\AffectationStatut;
use App\Support\Enums\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InvitationService
{
    public function acceptInvitation(string $token, string $newPassword): User
    {
        $affectation = Affectation::where('invitation_token', $token)
            ->where('statut', AffectationStatut::Invite)
            ->firstOrFail();

        $user = $affectation->etudiant;

        $user->update([
            'password'             => Hash::make($newPassword),
            'must_change_password' => false,
            'email_verified_at'    => now(),
        ]);

        $affectation->update([
            'statut'                 => AffectationStatut::Actif,
            'invitation_accepted_at' => now(),
            'invitation_token'       => null,
        ]);

        return $user;
    }

    public function createAndInviteStudent(
        int $stageId,
        string $nom,
        string $prenom,
        string $email
    ): Affectation {
        $temporaryPassword = Str::password(16);

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'nom'                  => $nom,
                'prenom'               => $prenom,
                'password'             => Hash::make($temporaryPassword),
                'role'                 => Role::Etudiant,
                'must_change_password' => true,
            ]
        );

        EtudiantProfile::firstOrCreate(['user_id' => $user->id]);

        $token = Str::uuid()->toString();

        $affectation = Affectation::firstOrCreate(
            ['stage_id' => $stageId, 'etudiant_id' => $user->id],
            [
                'date_affectation'  => now()->toDateString(),
                'statut'            => AffectationStatut::Invite,
                'invitation_token'  => $token,
                'invitation_sent_at' => now(),
            ]
        );

        $user->notify(new InvitationNotification($affectation->stage, $token, $temporaryPassword));

        return $affectation;
    }
}
