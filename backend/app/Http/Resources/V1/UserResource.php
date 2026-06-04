<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'nom'                  => $this->nom,
            'prenom'               => $this->prenom,
            'nom_complet'          => $this->full_name,
            'email'                => $this->email,
            'role'                 => $this->role->value,
            'must_change_password' => $this->must_change_password,
            'email_verified'       => !is_null($this->email_verified_at),
            'created_at'           => $this->created_at,
            'etablissements'       => $this->when(
                $this->isEnseignant() && $this->relationLoaded('enseignantProfile'),
                fn () => EtablissementResource::collection(
                    $this->enseignantProfile?->etablissements ?? new Collection()
                )
            ),
        ];
    }
}
