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
        // S2 — PFE / PFA themes (research-grade)
        $pfeTitres = [
            "Optimisation d'algorithmes de Deep Learning pour la santé",
            "Plateforme blockchain pour la certification de diplômes",
            "Cyber-résilience des systèmes d'information universitaires",
            "Analyse Big Data de la mobilité urbaine",
            "Moteur de recommandation académique par LLM",
            "Détection d'anomalies réseau par apprentissage non supervisé",
            "Architecture microservices pour ERP éducatif",
            "Compilateur expérimental pour langage pédagogique",
            "Reconnaissance vocale arabe pour interfaces d'accessibilité",
            "Pipeline NLP de classification sentiment des retours étudiants",
            "Système de fédération d'identités SAML pour campus",
            "Détection de fraude académique par graph neural networks",
        ];

        $pfeDescriptions = [
            "Recherche et développement d'algorithmes optimisés pour le traitement de données médicales sensibles avec garanties de confidentialité.",
            "Conception d'un système de certification immuable basé sur Polygon pour authentifier les diplômes universitaires tunisiens.",
            "Audit complet et renforcement de la sécurité périmétrique des serveurs de recherche contre les attaques modernes.",
            "Analyse prédictive en temps réel des flux de transport pour optimiser l'empreinte carbone des métropoles.",
            "Développement d'un moteur de recommandation basé sur les LLM pour personnaliser les parcours d'apprentissage.",
            "Détection en temps réel d'attaques réseau via clustering et autoencodeurs sur traces réseau.",
            "Refonte d'un ERP éducatif monolithique vers une architecture microservices avec Docker Swarm.",
            "Conception et implémentation d'un compilateur expérimental pour un langage pédagogique simplifié.",
            "Système de reconnaissance vocale en langue arabe pour interfaces accessibilité malvoyants.",
            "Pipeline NLP complet pour analyser les retours étudiants : tokenization, embeddings, classification sentiment.",
            "Mise en place d'une fédération SAML/OIDC pour le SSO inter-établissements du campus universitaire de Sfax.",
            "Modèle GNN sur graphe de soumissions d'examens pour détecter les patterns de fraude académique.",
        ];

        // S1 — Stage d'été (formation pratique, projet plus court)
        $steTitres = [
            "Développement d'un site vitrine pour PME locale",
            "Application mobile de gestion de tâches collaborative",
            "Tableau de bord BI pour suivi de KPI commerciaux",
            "Refactorisation d'une API REST legacy en Node.js",
            "Intégration d'un système de paiement en ligne (Flouci, e-Dinar)",
            "Mise en place d'une CI/CD avec GitLab et Docker",
            "Migration d'une application desktop vers Electron",
            "Conception d'un chatbot FAQ basé sur LangChain",
            "Outil de génération automatique de rapports PDF",
            "Refonte UI/UX d'une plateforme e-learning existante",
        ];

        $steDescriptions = [
            "Stage de découverte en agence web : conception et déploiement d'un site vitrine responsive avec WordPress et thème custom.",
            "Application Flutter de to-do collaborative avec synchronisation temps réel via Firebase.",
            "Conception d'un dashboard Power BI connecté à une base SQL Server pour le suivi des indicateurs commerciaux.",
            "Refactorisation d'une API REST en NestJS, ajout de tests unitaires et documentation OpenAPI.",
            "Intégration des passerelles de paiement tunisiennes (Flouci, e-Dinar) dans une boutique en ligne Laravel.",
            "Mise en place de pipelines CI/CD GitLab : build, tests, lint, déploiement Docker automatisé.",
            "Portage d'une application Win32 vers Electron + React tout en conservant les fonctionnalités natives.",
            "Chatbot FAQ pour le service support utilisant LangChain et un index vectoriel des documents internes.",
            "Outil CLI Python pour générer automatiquement des rapports PDF stylisés à partir de données CSV.",
            "Refonte UI/UX complète d'une plateforme e-learning : audit, wireframes, prototype Figma, intégration Tailwind.",
        ];

        $niveauxPfe = ['Master 1', 'Master 2', 'Ingénierie 3'];
        $niveauxSte = ['Licence 3', 'Ingénierie 2', 'Ingénierie 3'];

        // Year + semester combos. Past years → terminé. Current year (2025-2026) → actif/brouillon.
        // S1 dates: Jun–Sep of the first year of the range. S2 dates: Feb–Jun of the second year.
        $plan = [
            ['annee' => '2023-2024', 'semestre' => 'S1', 'past' => true,  'start' => '2023-06-15', 'end' => '2023-09-15'],
            ['annee' => '2023-2024', 'semestre' => 'S2', 'past' => true,  'start' => '2024-02-01', 'end' => '2024-06-15'],
            ['annee' => '2024-2025', 'semestre' => 'S1', 'past' => true,  'start' => '2024-06-15', 'end' => '2024-09-15'],
            ['annee' => '2024-2025', 'semestre' => 'S2', 'past' => true,  'start' => '2025-02-01', 'end' => '2025-06-15'],
            ['annee' => '2025-2026', 'semestre' => 'S1', 'past' => true,  'start' => '2025-06-15', 'end' => '2025-09-15'],
            ['annee' => '2025-2026', 'semestre' => 'S2', 'past' => false, 'start' => '2026-02-01', 'end' => '2026-06-30'],
        ];

        $enseignants = User::where('role', Role::Enseignant)
            ->with('enseignantProfile.etablissements')
            ->get();
        $etablissements = Etablissement::all();

        if ($enseignants->isEmpty() || $etablissements->isEmpty()) return;

        // Aim: 5 PFE (S2) + 5 stage d'été (S1) per enseignant, spread across all years.
        // 6 (year, semestre) slots → repeat picks so each type totals 5 per enseignant.
        $s1Slots = array_values(array_filter($plan, fn ($p) => $p['semestre'] === 'S1')); // 3 slots
        $s2Slots = array_values(array_filter($plan, fn ($p) => $p['semestre'] === 'S2')); // 3 slots

        // 5 S1 per enseignant — distribute round-robin across 3 S1 years (2+2+1)
        $s1Distribution = [
            $s1Slots[0], $s1Slots[0], // 2023-2024 S1 ×2
            $s1Slots[1], $s1Slots[1], // 2024-2025 S1 ×2
            $s1Slots[2],              // 2025-2026 S1 ×1
        ];
        // 5 S2 per enseignant
        $s2Distribution = [
            $s2Slots[0],              // 2023-2024 S2 ×1
            $s2Slots[1], $s2Slots[1], // 2024-2025 S2 ×2
            $s2Slots[2], $s2Slots[2], // 2025-2026 S2 ×2
        ];

        $perEnseignantPlan = array_merge($s1Distribution, $s2Distribution);

        $pfeIdx = 0;
        $steIdx = 0;

        foreach ($enseignants as $enseignant) {
            $myEtabs = $enseignant->enseignantProfile?->etablissements ?? collect();
            $pool    = $myEtabs->count() > 0 ? $myEtabs : $etablissements;

            foreach ($perEnseignantPlan as $slot) {
                $isPfe = $slot['semestre'] === 'S2';

                if ($isPfe) {
                    $titre = $pfeTitres[$pfeIdx % count($pfeTitres)];
                    $desc  = $pfeDescriptions[$pfeIdx % count($pfeDescriptions)];
                    $niveau = $niveauxPfe[array_rand($niveauxPfe)];
                    $pfeIdx++;
                } else {
                    $titre = $steTitres[$steIdx % count($steTitres)];
                    $desc  = $steDescriptions[$steIdx % count($steDescriptions)];
                    $niveau = $niveauxSte[array_rand($niveauxSte)];
                    $steIdx++;
                }

                $etab = $pool->random();

                if ($slot['past']) {
                    $stageStatut = StageStatut::Termine;
                    $affStatut   = AffectationStatut::Actif;
                } else {
                    // Current session — mix of actif (80%) and brouillon (20%)
                    $stageStatut = rand(1, 5) === 1 ? StageStatut::Brouillon : StageStatut::Actif;
                    $affStatut   = $stageStatut === StageStatut::Brouillon
                        ? AffectationStatut::Invite
                        : AffectationStatut::Actif;
                }

                $stage = Stage::create([
                    'titre'             => $titre,
                    'description'       => $desc,
                    'date_debut'        => $slot['start'],
                    'date_fin'          => $slot['end'],
                    'statut'            => $stageStatut,
                    'niveau'            => $niveau,
                    'annee_academique'  => $slot['annee'],
                    'semestre'          => $slot['semestre'],
                    'etablissement_id'  => $etab->id,
                    'enseignant_id'     => $enseignant->id,
                ]);

                // 2–5 students from the same établissement
                $etudiants = EtudiantProfile::where('etablissement_id', $etab->id)
                    ->inRandomOrder()
                    ->limit(rand(2, 5))
                    ->pluck('user_id');

                if ($etudiants->isEmpty()) {
                    $etudiants = EtudiantProfile::inRandomOrder()
                        ->limit(rand(2, 5))
                        ->pluck('user_id');
                }

                foreach ($etudiants as $etudiantId) {
                    Affectation::firstOrCreate(
                        ['stage_id' => $stage->id, 'etudiant_id' => $etudiantId],
                        [
                            'date_affectation'       => $slot['start'],
                            'statut'                 => $affStatut,
                            'invitation_accepted_at' => $affStatut === AffectationStatut::Actif ? $slot['start'] : null,
                        ]
                    );
                }
            }
        }
    }
}
