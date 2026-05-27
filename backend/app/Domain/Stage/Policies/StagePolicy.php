<?php

namespace App\Domain\Stage\Policies;

use App\Models\Stage;
use App\Models\User;
use App\Support\Enums\AffectationStatut;

class StagePolicy
{
    public function view(User $user, Stage $stage): bool
    {
        if ($user->isEnseignant()) {
            return $stage->enseignant_id === $user->id;
        }

        return $stage->affectations()
            ->where('etudiant_id', $user->id)
            ->where('statut', AffectationStatut::Actif)
            ->exists();
    }

    public function create(User $user): bool
    {
        return $user->isEnseignant();
    }

    public function update(User $user, Stage $stage): bool
    {
        return $user->isEnseignant() && $stage->enseignant_id === $user->id;
    }

    public function delete(User $user, Stage $stage): bool
    {
        return $user->isEnseignant() && $stage->enseignant_id === $user->id;
    }

    public function affecter(User $user, Stage $stage): bool
    {
        return $user->isEnseignant() && $stage->enseignant_id === $user->id;
    }
}
