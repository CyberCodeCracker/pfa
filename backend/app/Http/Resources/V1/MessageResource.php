<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'chat_type'       => $this->chat_type?->value,
            'chat_id'         => $this->chat_id,
            'contenu'         => $this->contenu,
            'has_attachment'  => !is_null($this->attachment_path),
            'attachment_mime' => $this->attachment_mime,
            'created_at'      => $this->created_at,
            'edited_at'       => $this->edited_at,
            'sender'          => new UserResource($this->whenLoaded('sender')),
        ];
    }
}
