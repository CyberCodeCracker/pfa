<?php

use App\Domain\Reunion\Notifications\MeetingReminderNotification;
use App\Models\Reunion;
use App\Models\Stage;
use App\Support\Enums\AffectationStatut;
use App\Support\Enums\ReunionStatut;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schedule;

// Rappel réunion H-24 : tous les jours à 08h00
Schedule::call(function () {
    $target = now()->addDay()->startOfMinute();
    $window = now()->addDay()->addMinutes(30);

    Reunion::whereBetween('scheduled_at', [$target, $window])
        ->where('statut', ReunionStatut::Planifiee)
        ->with('participants')
        ->each(function (Reunion $reunion) {
            foreach ($reunion->participants as $participant) {
                $participant->notify(new MeetingReminderNotification($reunion, 24));
            }
        });
})->dailyAt('08:00')->name('reunion-rappel-h24');

// Rappel réunion H-1 : toutes les heures
Schedule::call(function () {
    $target = now()->addHour()->startOfMinute();
    $window = now()->addHour()->addMinutes(5);

    Reunion::whereBetween('scheduled_at', [$target, $window])
        ->where('statut', ReunionStatut::Planifiee)
        ->with('participants')
        ->each(function (Reunion $reunion) {
            foreach ($reunion->participants as $participant) {
                $participant->notify(new MeetingReminderNotification($reunion, 1));
            }
        });
})->hourly()->name('reunion-rappel-h1');

// Vérification deadlines stages J-1
Schedule::call(function () {
    $tomorrow = now()->addDay()->toDateString();

    Stage::where('date_fin', $tomorrow)
        ->where('statut', 'actif')
        ->with(['affectations' => fn ($q) => $q->where('statut', AffectationStatut::Actif)->with('etudiant')])
        ->each(function (Stage $stage) {
            foreach ($stage->affectations as $affectation) {
                if ($affectation->etudiant) {
                    $affectation->etudiant->notify(
                        new \App\Domain\Stage\Notifications\StageDeadlineNotification($stage)
                    );
                }
            }
        });
})->dailyAt('09:00')->name('stage-deadline-reminder');
