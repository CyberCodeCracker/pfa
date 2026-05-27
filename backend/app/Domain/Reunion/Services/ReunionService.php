<?php

namespace App\Domain\Reunion\Services;

use App\Domain\Notification\Notifications\MeetingInvitationNotification;
use App\Models\Reunion;
use App\Models\Stage;
use App\Models\User;
use App\Support\Enums\ReunionStatut;
use Illuminate\Support\Facades\Notification;

class ReunionService
{
    public function planifier(Stage $stage, User $enseignant, array $data): Reunion
    {
        $reunion = Reunion::create([
            'stage_id'         => $stage->id,
            'enseignant_id'    => $enseignant->id,
            'sujet'            => $data['sujet'],
            'description'      => $data['description'] ?? null,
            'scheduled_at'     => $data['scheduled_at'],
            'duration_minutes' => $data['duration_minutes'] ?? 60,
            'meet_url'         => $data['meet_url'] ?? null,
            'statut'           => ReunionStatut::Planifiee,
        ]);

        $participantIds = $data['participant_ids'] ?? [];
        foreach ($participantIds as $userId) {
            $reunion->participants()->attach($userId, ['statut' => 'invité']);
        }

        $participants = $reunion->participants()->get();
        Notification::send($participants, new MeetingInvitationNotification($reunion));

        return $reunion->load('participants');
    }

    public function annuler(Reunion $reunion): Reunion
    {
        $reunion->update(['statut' => ReunionStatut::Annulee]);
        return $reunion;
    }

    public function repondre(Reunion $reunion, User $user, string $statut): void
    {
        $reunion->participants()->updateExistingPivot($user->id, ['statut' => $statut]);
    }
}
