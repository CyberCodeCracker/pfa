<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'contenu'     => $this->contenu,
            'note'        => $this->note,
            'created_at'  => $this->created_at,
            'enseignant'  => new UserResource($this->whenLoaded('enseignant')),
            'etudiant'    => new UserResource($this->whenLoaded('etudiant')),
            'document'    => new DocumentResource($this->whenLoaded('document')),
        ];
    }
}
