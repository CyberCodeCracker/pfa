<?php

namespace App\Domain\Stage\Services;

use App\Domain\Auth\Services\InvitationService;
use App\Models\Affectation;
use App\Models\Stage;
use App\Models\User;
use App\Support\Enums\AffectationStatut;
use App\Support\Enums\StageStatut;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class StageService
{
    public function __construct(
        private InvitationService $invitationService,
    ) {}

    public function listForUser(User $user, int $perPage = 20): LengthAwarePaginator
    {
        $query = $user->isEnseignant()
            ? Stage::where('enseignant_id', $user->id)
            : Stage::whereHas('affectations', fn ($q) =>
                $q->where('etudiant_id', $user->id)->where('statut', 'actif')
              );

        return QueryBuilder::for($query)
            ->allowedFilters([
                AllowedFilter::exact('statut'),
                AllowedFilter::exact('etablissement_id'),
                AllowedFilter::exact('annee_academique'),
                AllowedFilter::exact('semestre'),
            ])
            ->allowedSorts(['date_debut', 'date_fin', 'titre', 'created_at'])
            ->defaultSort('-created_at')
            ->with([
                'etablissement',
                'enseignant',
                'affectations' => fn ($q) => $q->where('statut', AffectationStatut::Actif)->with('etudiant'),
            ])
            ->withCount(['affectations' => fn ($q) => $q->where('statut', AffectationStatut::Actif)])
            ->paginate($perPage);
    }

    public function create(User $enseignant, array $data): Stage
    {
        $stage = Stage::create([
            ...$data,
            'enseignant_id' => $enseignant->id,
            'statut'        => StageStatut::Brouillon,
        ]);

        return $stage;
    }

    public function update(Stage $stage, array $data): Stage
    {
        $stage->update($data);
        return $stage->fresh();
    }

    public function archive(Stage $stage): Stage
    {
        $stage->update(['statut' => StageStatut::Archive]);
        return $stage;
    }

    public function delete(Stage $stage): void
    {
        $stage->delete();
    }

    public function affecterEtudiants(Stage $stage, array $etudiants): array
    {
        $affectations = [];

        foreach ($etudiants as $etudiantData) {
            $affectations[] = $this->invitationService->createAndInviteStudent(
                $stage->id,
                $etudiantData['nom'],
                $etudiantData['prenom'],
                $etudiantData['email'],
            );
        }

        return $affectations;
    }

    public function retirerEtudiant(Stage $stage, User $etudiant): void
    {
        Affectation::where('stage_id', $stage->id)
            ->where('etudiant_id', $etudiant->id)
            ->update(['statut' => AffectationStatut::Retire]);
    }
}
