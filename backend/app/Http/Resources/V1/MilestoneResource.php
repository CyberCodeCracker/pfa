<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MilestoneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'stage_id'     => $this->stage_id,
            'titre'        => $this->titre,
            'description'  => $this->description,
            'ordre'        => $this->ordre,
            'statut'       => $this->statut?->value,
            'completed_at' => $this->completed_at,
            'validated_at' => $this->validated_at,
            'created_at'   => $this->created_at,
        ];
    }
}
