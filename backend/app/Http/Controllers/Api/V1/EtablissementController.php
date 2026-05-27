<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\EtablissementResource;
use App\Models\Etablissement;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EtablissementController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return EtablissementResource::collection(Etablissement::orderBy('nom')->get());
    }
}
