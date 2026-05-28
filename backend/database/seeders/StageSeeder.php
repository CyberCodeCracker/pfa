<?php

namespace Database\Seeders;

use App\Models\Affectation;
use App\Models\Etablissement;
use App\Models\EtudiantProfile;
use App\Models\Stage;
use App\Models\User;
use App\Support\Enums\AffectationStatut;
use App\Support\Enums\Role;
use App\Support\Enums\StageStatut;
use Illuminate\Database\Seeder;

class StageSeeder extends Seeder
{
    public function run(): void
    {
        $titres = [
            "Optimisation d'algorithmes de Deep Learning pour la santé",
            "Plateforme blockchain pour la certification de diplômes",
            "Système d'irrigation intelligent IoT",
            "Cyber-résilience des systèmes d'information universitaires",
            "Analyse Big Data de la mobilité urbaine",
            "Moteur de recommandation académique par LLM",
            "Détection d'anomalies réseau par apprentissage non supervisé",
            "Application mobile de suivi de stages académiques",
            "Reconnaissance vocale pour interface accessibilité",
            "Architecture microservices pour ERP éducatif",
            "Compilateur expérimental pour langage pédagogique",
            "Analyse sentiment des retours étudiants par NLP",
        ];

        $descriptions = [
            "Recherche et développement d'algorithmes optimisés pour le traitement de données médicales sensibles avec garanties de confidentialité.",
            "Conception d'un système de certification immuable basé sur Polygon pour authentifier les diplômes universitaires tunisiens.",
            "Développement d'objets connectés autonomes pour la gestion intelligente de l'irrigation en zones agricoles.",
            "Audit complet et renforcement de la sécurité périmétrique des serveurs de recherche contre les attaques modernes.",
            "Analyse prédictive en temps réel des flux de transport pour optimiser l'empreinte carbone des métropoles.",
            "Développement d'un moteur de recommandation basé sur les LLM pour personnaliser les parcours d'apprentissage.",
            "Détection en temps réel d'attaques réseau via clustering et autoencodeurs sur traces réseau.",
            "Application Flutter multi-plateforme pour le suivi des stages avec notifications temps réel.",
            "Système de reconnaissance vocale en langue arabe pour interfaces accessibilité malvoyants.",
            "Refonte d'un ERP éducatif monolithique vers une architecture microservices avec Docker Swarm.",
            "Conception et implémentation d'un compilateur expérimental pour un langage pédagogique simplifié.",
            "Pipeline NLP complet pour analyser les retours étudiants : tokenization, embeddings, classification sentiment.",
        ];

        $statuts = [StageStatut::Actif, StageStatut::Actif, StageStatut::Actif, StageStatut::Brouillon, StageStatut::Termine];
        $niveaux = ['Licence 3', 'Master 1', 'Master 2', 'Ingénierie 2', 'Ingénierie 3'];

        $enseignants = User::where('role', Role::Enseignant)->get();
        $etablissements = Etablissement::all();

        if ($enseignants->isEmpty() || $etablissements->isEmpty()) return;

        $titreIdx = 0;
        foreach ($enseignants as $enseignant) {
            $nbStages = rand(2, 4);
            for ($i = 0; $i < $nbStages; $i++) {
                if ($titreIdx >= count($titres)) $titreIdx = 0;

                $etab = $etablissements->random();
                $statut = $statuts[array_rand($statuts)];
                $dateDebut = now()->subDays(rand(0, 60));
                $dateFin   = (clone $dateDebut)->addMonths(rand(3, 6));

                $stage = Stage::create([
                    'titre'            => $titres[$titreIdx],
                    'description'      => $descriptions[$titreIdx],
                    'date_debut'       => $dateDebut->toDateString(),
                    'date_fin'         => $dateFin->toDateString(),
                    'statut'           => $statut,
                    'niveau'           => $niveaux[array_rand($niveaux)],
                    'etablissement_id' => $etab->id,
                    'enseignant_id'    => $enseignant->id,
                ]);

                // Affect 1–3 students from the same établissement
                if ($statut === StageStatut::Actif || $statut === StageStatut::Termine) {
                    $etudiants = EtudiantProfile::where('etablissement_id', $etab->id)
                        ->inRandomOrder()
                        ->limit(rand(1, 3))
                        ->pluck('user_id');

                    foreach ($etudiants as $etudiantId) {
                        Affectation::firstOrCreate(
                            ['stage_id' => $stage->id, 'etudiant_id' => $etudiantId],
                            [
                                'date_affectation'       => $dateDebut->toDateString(),
                                'statut'                 => AffectationStatut::Actif,
                                'invitation_accepted_at' => $dateDebut,
                            ]
                        );
                    }
                }

                $titreIdx++;
            }
        }
    }
}
