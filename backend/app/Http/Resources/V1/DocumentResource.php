<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'nom'                 => $this->nom,
            'mime'                => $this->mime,
            'taille'              => $this->taille,
            'statut'              => $this->statut?->value,
            'commentaire'         => $this->commentaire,
            'version'             => $this->version,
            'parent_document_id'  => $this->parent_document_id,
            'date_upload'         => $this->date_upload,
            'download_url'        => $this->resource->exists
                ? \URL::temporarySignedRoute('documents.download', now()->addMinutes(30), ['document' => $this->id])
                : null,
            'uploader'            => new UserResource($this->whenLoaded('uploader')),
        ];
    }
}
