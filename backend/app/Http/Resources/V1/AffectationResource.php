<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AffectationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'statut'                  => $this->statut?->value,
            'date_affectation'        => $this->date_affectation?->toDateString(),
            'invitation_sent_at'      => $this->invitation_sent_at,
            'invitation_accepted_at'  => $this->invitation_accepted_at,
            'etudiant'                => new UserResource($this->whenLoaded('etudiant')),
        ];
    }
}
