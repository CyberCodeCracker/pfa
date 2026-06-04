<?php

namespace App\Domain\Stage\Services;

use App\Models\Milestone;
use App\Models\Stage;
use App\Support\Enums\Semestre;

class MilestoneTemplateService
{
    /**
     * Default milestone templates by semestre.
     * S2 = PFE / PFA — long-form research project.
     * S1 = Stage d'été — short-form integration in a company.
     */
    public function templateFor(?Semestre $semestre): array
    {
        return match ($semestre) {
            Semestre::S2 => [
                ['titre' => 'Analyse des besoins',         'description' => "Étude du contexte, recueil des exigences fonctionnelles et non fonctionnelles, livrable : cahier des charges."],
                ['titre' => 'Conception et planification', 'description' => "Architecture technique, choix des technologies, planning détaillé, modèles UML."],
                ['titre' => 'Développement',                'description' => "Implémentation itérative des fonctionnalités selon le découpage en sprints."],
                ['titre' => 'Tests & validation',          'description' => "Tests unitaires, d'intégration et utilisateurs. Correction des anomalies."],
                ['titre' => 'Rédaction du rapport',        'description' => "Rédaction du mémoire de PFE/PFA selon le canevas universitaire."],
                ['titre' => 'Soutenance',                  'description' => "Préparation du support de présentation et soutenance devant le jury."],
            ],
            default => [
                ['titre' => 'Intégration & onboarding',  'description' => "Découverte de l'entreprise, de l'équipe et des outils de travail."],
                ['titre' => 'Analyse fonctionnelle',     'description' => "Compréhension du besoin métier et des contraintes du projet."],
                ['titre' => 'Développement',             'description' => "Réalisation des tâches attribuées, contribution au projet d'équipe."],
                ['titre' => 'Restitution finale',        'description' => "Présentation du travail réalisé et rédaction du rapport de stage."],
            ],
        };
    }

    public function seedDefaults(Stage $stage): void
    {
        if ($stage->milestones()->exists()) {
            return;
        }

        foreach ($this->templateFor($stage->semestre) as $i => $tpl) {
            Milestone::create([
                'stage_id'    => $stage->id,
                'titre'       => $tpl['titre'],
                'description' => $tpl['description'],
                'ordre'       => $i + 1,
            ]);
        }
    }
}
