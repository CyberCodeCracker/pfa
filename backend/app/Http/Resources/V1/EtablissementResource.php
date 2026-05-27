<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EtablissementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'   => $this->id,
            'nom'  => $this->nom,
            'code' => $this->code,
            'ville' => $this->ville,
        ];
    }
}
