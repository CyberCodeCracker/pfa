<?php

namespace Database\Seeders;

use App\Models\Reunion;
use App\Models\Stage;
use App\Support\Enums\AffectationStatut;
use App\Support\Enums\ReunionStatut;
use App\Support\Enums\StageStatut;
use Illuminate\Database\Seeder;

class ReunionSeeder extends Seeder
{
    public function run(): void
    {
        $sujets = [
            "Réunion de cadrage initial",
            "Point d'avancement mi-stage",
            "Revue de code et architecture",
            "Présentation des résultats préliminaires",
            "Discussion sur la méthodologie",
            "Soutenance blanche",
            "Validation du livrable final",
            "Sync hebdomadaire",
            "Revue des objectifs trimestriels",
            "Brainstorming sur l'orientation du projet",
        ];

        $descriptions = [
            "Premier rendez-vous pour aligner les attentes et présenter les objectifs détaillés du projet.",
            "Point d'étape pour évaluer l'avancement et ajuster la trajectoire si nécessaire.",
            "Revue technique approfondie du code produit et des choix d'architecture.",
            "Présentation et discussion des premiers résultats expérimentaux obtenus.",
            null,
        ];

        $stages = Stage::whereIn('statut', [StageStatut::Actif, StageStatut::Termine])->with('affectations')->get();
        if ($stages->isEmpty()) return;

        foreach ($stages as $stage) {
            // Past meeting (completed)
            $past = Reunion::create([
                'stage_id'         => $stage->id,
                'enseignant_id'    => $stage->enseignant_id,
                'sujet'            => $sujets[array_rand($sujets)],
                'description'      => $descriptions[array_rand($descriptions)],
                'scheduled_at'     => now()->subDays(rand(7, 30))->setTime(10, 0),
                'duration_minutes' => 60,
                'meet_url'         => 'https://meet.google.com/' . strtolower(substr(md5(rand()), 0, 3) . '-' . substr(md5(rand()), 0, 4) . '-' . substr(md5(rand()), 0, 3)),
                'statut'           => ReunionStatut::Terminee,
            ]);

            // Upcoming meeting (scheduled)
            $upcoming = Reunion::create([
                'stage_id'         => $stage->id,
                'enseignant_id'    => $stage->enseignant_id,
                'sujet'            => $sujets[array_rand($sujets)],
                'description'      => $descriptions[array_rand($descriptions)],
                'scheduled_at'     => now()->addDays(rand(2, 21))->setTime(rand(9, 16), [0, 30][rand(0, 1)]),
                'duration_minutes' => [30, 45, 60, 90][rand(0, 3)],
                'meet_url'         => 'https://meet.google.com/' . strtolower(substr(md5(rand()), 0, 3) . '-' . substr(md5(rand()), 0, 4) . '-' . substr(md5(rand()), 0, 3)),
                'statut'           => ReunionStatut::Planifiee,
            ]);

            // Attach affected students as participants
            $etudiantIds = $stage->affectations
                ->where('statut', AffectationStatut::Actif)
                ->pluck('etudiant_id');

            foreach ([$past, $upcoming] as $reunion) {
                foreach ($etudiantIds as $etudiantId) {
                    $reunion->participants()->attach($etudiantId, ['statut' => 'invité']);
                }
            }
        }
    }
}
