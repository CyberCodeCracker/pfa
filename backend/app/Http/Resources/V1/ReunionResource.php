<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReunionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'sujet'            => $this->sujet,
            'description'      => $this->description,
            'scheduled_at'     => $this->scheduled_at,
            'duration_minutes' => $this->duration_minutes,
            'meet_url'         => $this->meet_url,
            'statut'           => $this->statut?->value,
            'created_at'       => $this->created_at,
            'stage'            => new StageResource($this->whenLoaded('stage')),
            'enseignant'       => new UserResource($this->whenLoaded('enseignant')),
            'participants'     => UserResource::collection($this->whenLoaded('participants')),
        ];
    }
}
