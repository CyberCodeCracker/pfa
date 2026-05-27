<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Reunion\Services\ReunionService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ReunionResource;
use App\Models\Reunion;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReunionController extends Controller
{
    public function __construct(private ReunionService $reunionService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = $user->isEnseignant()
            ? Reunion::whereHas('stage', fn ($q) => $q->where('enseignant_id', $user->id))
            : Reunion::whereHas('participants', fn ($q) => $q->where('user_id', $user->id));

        $reunions = $query->with(['stage', 'enseignant', 'participants'])
            ->orderBy('scheduled_at')
            ->paginate(50);

        return ReunionResource::collection($reunions);
    }

    public function store(Request $request, Stage $stage): JsonResponse
    {
        $this->authorize('update', $stage);

        $validated = $request->validate([
            'sujet'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'scheduled_at'     => ['required', 'date', 'after:now'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'meet_url'         => ['nullable', 'url'],
            'participant_ids'  => ['array'],
            'participant_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $reunion = $this->reunionService->planifier($stage, $request->user(), $validated);

        return response()->json(['data' => new ReunionResource($reunion)], 201);
    }

    public function update(Request $request, Reunion $reunion): JsonResponse
    {
        $this->authorize('update', $reunion->stage);

        $validated = $request->validate([
            'sujet'            => ['sometimes', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'scheduled_at'     => ['sometimes', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'meet_url'         => ['nullable', 'url'],
        ]);

        $reunion->update($validated);

        return response()->json(['data' => new ReunionResource($reunion->fresh())]);
    }

    public function annuler(Request $request, Reunion $reunion): JsonResponse
    {
        $this->authorize('update', $reunion->stage);
        $reunion = $this->reunionService->annuler($reunion);
        return response()->json(['data' => new ReunionResource($reunion)]);
    }

    public function repondre(Request $request, Reunion $reunion, User $user): JsonResponse
    {
        $request->validate([
            'statut' => ['required', 'in:accepté,décliné'],
        ]);

        $this->reunionService->repondre($reunion, $user, $request->input('statut'));

        return response()->json(['message' => 'Réponse enregistrée.']);
    }
}
