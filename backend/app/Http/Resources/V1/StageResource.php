<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'titre'            => $this->titre,
            'description'      => $this->description,
            'date_debut'       => $this->date_debut?->toDateString(),
            'date_fin'         => $this->date_fin?->toDateString(),
            'statut'           => $this->statut?->value,
            'pace_indicator'   => $this->pace_indicator?->value,
            'niveau'           => $this->niveau,
            'created_at'       => $this->created_at,
            'annee_academique'  => $this->annee_academique,
            'semestre'         => $this->semestre?->value,
            'etablissement'    => new EtablissementResource($this->whenLoaded('etablissement')),
            'enseignant'       => new UserResource($this->whenLoaded('enseignant')),
            'affectations'     => AffectationResource::collection($this->whenLoaded('affectations')),
            'etudiants_count'  => $this->whenCounted('affectations'),
            'milestones'       => MilestoneResource::collection($this->whenLoaded('milestones')),
            'milestones_count'           => $this->whenCounted('milestones'),
            'milestones_done_count'      => $this->when(
                isset($this->milestones_done_count),
                fn () => (int) $this->milestones_done_count,
            ),
        ];
    }
}
