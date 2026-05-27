<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Stage\Services\StageService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\StageResource;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StageController extends Controller
{
    public function __construct(private StageService $stageService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $stages = $this->stageService->listForUser($request->user(), (int) $request->get('per_page', 20));
        return StageResource::collection($stages);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Stage::class);

        $validated = $request->validate([
            'titre'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'date_debut'       => ['required', 'date'],
            'date_fin'         => ['required', 'date', 'after:date_debut'],
            'niveau'           => ['nullable', 'string', 'max:100'],
            'etablissement_id' => ['required', 'integer', 'exists:etablissements,id'],
        ]);

        $stage = $this->stageService->create($request->user(), $validated);

        return response()->json(['data' => new StageResource($stage)], 201);
    }

    public function show(Request $request, Stage $stage): JsonResponse
    {
        $this->authorize('view', $stage);

        return response()->json(['data' => new StageResource($stage->load(['etablissement', 'enseignant', 'affectations.etudiant']))]);
    }

    public function update(Request $request, Stage $stage): JsonResponse
    {
        $this->authorize('update', $stage);

        $validated = $request->validate([
            'titre'            => ['sometimes', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'date_debut'       => ['sometimes', 'date'],
            'date_fin'         => ['sometimes', 'date'],
            'niveau'           => ['nullable', 'string', 'max:100'],
            'statut'           => ['sometimes', 'string', 'in:brouillon,actif,archivé,terminé'],
            'etablissement_id' => ['sometimes', 'integer', 'exists:etablissements,id'],
        ]);

        $stage = $this->stageService->update($stage, $validated);

        return response()->json(['data' => new StageResource($stage)]);
    }

    public function destroy(Request $request, Stage $stage): JsonResponse
    {
        $this->authorize('delete', $stage);

        $this->stageService->delete($stage);

        return response()->json(null, 204);
    }

    public function affecter(Request $request, Stage $stage): JsonResponse
    {
        $this->authorize('affecter', $stage);

        $validated = $request->validate([
            'etudiants'             => ['required', 'array', 'min:1'],
            'etudiants.*.nom'       => ['required', 'string', 'max:100'],
            'etudiants.*.prenom'    => ['required', 'string', 'max:100'],
            'etudiants.*.email'     => ['required', 'email', 'max:255'],
        ]);

        $affectations = $this->stageService->affecterEtudiants($stage, $validated['etudiants']);

        return response()->json(['data' => $affectations, 'message' => count($affectations) . ' étudiant(s) invité(s).'], 201);
    }

    public function retirerEtudiant(Request $request, Stage $stage, User $etudiant): JsonResponse
    {
        $this->authorize('affecter', $stage);
        $this->stageService->retirerEtudiant($stage, $etudiant);
        return response()->json(null, 204);
    }
}
