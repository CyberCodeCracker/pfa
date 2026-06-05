<?php

namespace Database\Seeders;

use App\Domain\Stage\Services\MilestoneTemplateService;
use App\Models\Affectation;
use App\Models\Etablissement;
use App\Models\EtudiantProfile;
use App\Models\Milestone;
use App\Models\Stage;
use App\Models\User;
use App\Support\Enums\AffectationStatut;
use App\Support\Enums\MilestoneStatut;
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

        // Year + type combos. Past years → terminé. Current year (2025-2026) → actif.
        // 'ete' (stage d'été) runs Jun–Sep. 'pfe'/'pfa' (S2 projects) run Feb–Jun.
        $plan = [
            ['annee' => '2023-2024', 'type' => 'ete', 'past' => true,  'start' => '2023-06-15', 'end' => '2023-09-15'],
            ['annee' => '2023-2024', 'type' => 'pfa', 'past' => true,  'start' => '2024-02-01', 'end' => '2024-06-15'],
            ['annee' => '2024-2025', 'type' => 'ete', 'past' => true,  'start' => '2024-06-15', 'end' => '2024-09-15'],
            ['annee' => '2024-2025', 'type' => 'pfa', 'past' => true,  'start' => '2025-02-01', 'end' => '2025-06-15'],
            ['annee' => '2024-2025', 'type' => 'pfe', 'past' => true,  'start' => '2025-02-01', 'end' => '2025-06-15'],
            ['annee' => '2025-2026', 'type' => 'ete', 'past' => true,  'start' => '2025-06-15', 'end' => '2025-09-15'],
            ['annee' => '2025-2026', 'type' => 'pfe', 'past' => false, 'start' => '2026-02-01', 'end' => '2026-06-30'],
            ['annee' => '2025-2026', 'type' => 'pfa', 'past' => false, 'start' => '2026-02-01', 'end' => '2026-06-30'],
        ];

        $enseignants = User::where('role', Role::Enseignant)
            ->with('enseignantProfile.etablissements')
            ->get();
        $etablissements = Etablissement::all();

        if ($enseignants->isEmpty() || $etablissements->isEmpty()) return;

        // Aim per enseignant: ~3 stages d'été + ~3 PFE + ~3 PFA, spread across years.
        $eteSlots = array_values(array_filter($plan, fn ($p) => $p['type'] === 'ete'));  // 3 slots
        $pfeSlots = array_values(array_filter($plan, fn ($p) => $p['type'] === 'pfe'));  // 2 slots
        $pfaSlots = array_values(array_filter($plan, fn ($p) => $p['type'] === 'pfa'));  // 3 slots

        $perEnseignantPlan = array_merge(
            $eteSlots,          // 3 stages d'été
            $pfeSlots,          // 2 PFE (will mostly land in current + 2024-2025)
            $pfeSlots,          // duplicate to hit ~4 PFE
            $pfaSlots,          // 3 PFA spread across years
        );

        $pfeIdx = 0;
        $steIdx = 0;

        foreach ($enseignants as $enseignant) {
            $myEtabs = $enseignant->enseignantProfile?->etablissements ?? collect();
            $pool    = $myEtabs->count() > 0 ? $myEtabs : $etablissements;

            foreach ($perEnseignantPlan as $slot) {
                $isS2 = in_array($slot['type'], ['pfe', 'pfa'], true);

                if ($isS2) {
                    $titre  = $pfeTitres[$pfeIdx % count($pfeTitres)];
                    $desc   = $pfeDescriptions[$pfeIdx % count($pfeDescriptions)];
                    $niveau = $niveauxPfe[array_rand($niveauxPfe)];
                    $pfeIdx++;
                } else {
                    $titre  = $steTitres[$steIdx % count($steTitres)];
                    $desc   = $steDescriptions[$steIdx % count($steDescriptions)];
                    $niveau = $niveauxSte[array_rand($niveauxSte)];
                    $steIdx++;
                }

                $etab = $pool->random();

                if ($slot['past']) {
                    $stageStatut = StageStatut::Termine;
                    $affStatut   = AffectationStatut::Actif;
                } else {
                    // Current session — mix of actif (85%) and suspendu (15%)
                    $stageStatut = rand(1, 7) === 1 ? StageStatut::Suspendu : StageStatut::Actif;
                    $affStatut   = AffectationStatut::Actif;
                }

                $stage = Stage::create([
                    'titre'             => $titre,
                    'description'       => $desc,
                    'date_debut'        => $slot['start'],
                    'date_fin'          => $slot['end'],
                    'statut'            => $stageStatut,
                    'niveau'            => $niveau,
                    'annee_academique'  => $slot['annee'],
                    'semestre'          => $slot['type'],
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

                $this->seedMilestonesForStage($stage, $slot['past']);
            }
        }
    }

    private function seedMilestonesForStage(Stage $stage, bool $past): void
    {
        $templates = app(MilestoneTemplateService::class)->templateFor($stage->semestre);
        $total = count($templates);

        // Past stages → all validated. Current stages → progress between 1 and total-1.
        $doneCount = $past
            ? $total
            : rand(1, max(1, $total - 1));

        foreach ($templates as $i => $tpl) {
            $statut       = MilestoneStatut::Pending;
            $completedAt  = null;
            $validatedAt  = null;

            if ($i < $doneCount) {
                $statut      = MilestoneStatut::Validated;
                $completedAt = now()->subDays(rand(5, 60));
                $validatedAt = $completedAt->copy()->addDays(rand(1, 3));
            } elseif ($i === $doneCount) {
                // The "next" one is in progress (or, 30% of the time, completed waiting validation)
                $statut = rand(1, 10) <= 3 ? MilestoneStatut::Completed : MilestoneStatut::InProgress;
                if ($statut === MilestoneStatut::Completed) {
                    $completedAt = now()->subDays(rand(1, 5));
                }
            }

            Milestone::create([
                'stage_id'     => $stage->id,
                'titre'        => $tpl['titre'],
                'description'  => $tpl['description'],
                'ordre'        => $i + 1,
                'statut'       => $statut,
                'completed_at' => $completedAt,
                'validated_at' => $validatedAt,
            ]);
        }
    }
}
