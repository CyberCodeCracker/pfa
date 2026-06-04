<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\MilestoneResource;
use App\Models\Milestone;
use App\Models\Stage;
use App\Support\Enums\MilestoneStatut;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MilestoneController extends Controller
{
    public function index(Request $request, Stage $stage): AnonymousResourceCollection
    {
        $this->authorize('view', $stage);
        return MilestoneResource::collection($stage->milestones()->get());
    }

    public function store(Request $request, Stage $stage): JsonResponse
    {
        $this->authorize('update', $stage);

        $validated = $request->validate([
            'titre'       => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
        ]);

        $ordre = ((int) $stage->milestones()->max('ordre')) + 1;

        $milestone = Milestone::create([
            ...$validated,
            'stage_id' => $stage->id,
            'ordre'    => $ordre,
        ]);

        return response()->json(['data' => new MilestoneResource($milestone)], 201);
    }

    public function update(Request $request, Milestone $milestone): JsonResponse
    {
        $this->authorize('update', $milestone->stage);

        $validated = $request->validate([
            'titre'       => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'ordre'       => ['sometimes', 'integer', 'min:1'],
        ]);

        $milestone->update($validated);

        return response()->json(['data' => new MilestoneResource($milestone->fresh())]);
    }

    public function destroy(Request $request, Milestone $milestone): JsonResponse
    {
        $this->authorize('update', $milestone->stage);
        $milestone->delete();
        return response()->json(null, 204);
    }

    /**
     * Student marks a milestone as completed (awaiting teacher validation).
     */
    public function markComplete(Request $request, Milestone $milestone): JsonResponse
    {
        $this->authorize('view', $milestone->stage);

        $milestone->update([
            'statut'       => MilestoneStatut::Completed,
            'completed_at' => now(),
        ]);

        return response()->json(['data' => new MilestoneResource($milestone->fresh())]);
    }

    /**
     * Teacher validates a completed milestone — counts toward final progress.
     */
    public function validate_(Request $request, Milestone $milestone): JsonResponse
    {
        $this->authorize('update', $milestone->stage);

        $milestone->update([
            'statut'       => MilestoneStatut::Validated,
            'validated_at' => now(),
            'completed_at' => $milestone->completed_at ?? now(),
        ]);

        return response()->json(['data' => new MilestoneResource($milestone->fresh())]);
    }

    /**
     * Teacher reverts a milestone back to pending / in_progress.
     */
    public function reopen(Request $request, Milestone $milestone): JsonResponse
    {
        $this->authorize('update', $milestone->stage);

        $milestone->update([
            'statut'       => MilestoneStatut::InProgress,
            'completed_at' => null,
            'validated_at' => null,
        ]);

        return response()->json(['data' => new MilestoneResource($milestone->fresh())]);
    }
}
