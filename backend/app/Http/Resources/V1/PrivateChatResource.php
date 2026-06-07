<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrivateChatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'enseignant'    => new UserResource($this->whenLoaded('enseignant')),
            'etudiant'      => new UserResource($this->whenLoaded('etudiant')),
            'unread_count'  => $this->unread_count ?? 0,
            'created_at'    => $this->created_at,
        ];
    }
}
