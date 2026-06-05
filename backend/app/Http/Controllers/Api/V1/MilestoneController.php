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
            'ordre'       => ['nullable', 'integer', 'min:1'],
        ]);

        $last = (int) $stage->milestones()->max('ordre');

        // Clamp requested ordre to [1, last+1]; default to last+1 (append).
        $ordre = isset($validated['ordre'])
            ? max(1, min($last + 1, (int) $validated['ordre']))
            : $last + 1;

        // Reject inserting before an already-validated milestone — would rewind the workflow.
        if ($ordre <= $last) {
            $blocker = $stage->milestones()
                ->where('ordre', '>=', $ordre)
                ->whereIn('statut', [MilestoneStatut::Validated, MilestoneStatut::Completed])
                ->orderBy('ordre')
                ->first();

            if ($blocker) {
                $label = $blocker->statut === MilestoneStatut::Validated ? 'validée' : 'en attente de validation';
                return response()->json([
                    'message' => "Impossible d'insérer à la position {$ordre} : l'étape \"{$blocker->titre}\" (position {$blocker->ordre}) est déjà {$label}. Choisissez une position après celle-ci.",
                ], 422);
            }

            // Shift existing milestones at/after this position down by 1.
            $stage->milestones()->where('ordre', '>=', $ordre)->increment('ordre');
        }

        $milestone = Milestone::create([
            'titre'       => $validated['titre'],
            'description' => $validated['description'] ?? null,
            'stage_id'    => $stage->id,
            'ordre'       => $ordre,
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

        // If ordre is changing, reorder all milestones in the stage
        if (array_key_exists('ordre', $validated) && (int) $validated['ordre'] !== $milestone->ordre) {
            $stage    = $milestone->stage;
            $last     = (int) $stage->milestones()->max('ordre');
            $newOrdre = max(1, min($last, (int) $validated['ordre']));
            $oldOrdre = $milestone->ordre;

            // Reject moves that would push this milestone into the locked region,
            // or that would step over a validated/completed milestone.
            $rangeStart = min($oldOrdre, $newOrdre);
            $rangeEnd   = max($oldOrdre, $newOrdre);

            $blocker = $stage->milestones()
                ->where('id', '!=', $milestone->id)
                ->whereBetween('ordre', [$rangeStart, $rangeEnd])
                ->whereIn('statut', [MilestoneStatut::Validated, MilestoneStatut::Completed])
                ->orderBy('ordre')
                ->first();

            if ($blocker) {
                $label = $blocker->statut === MilestoneStatut::Validated ? 'validée' : 'en attente de validation';
                return response()->json([
                    'message' => "Impossible de déplacer vers la position {$newOrdre} : cela traverserait l'étape \"{$blocker->titre}\" (position {$blocker->ordre}) qui est déjà {$label}.",
                ], 422);
            }

            // Shift neighbours: move others by one slot in the opposite direction
            if ($newOrdre < $oldOrdre) {
                $stage->milestones()
                    ->where('id', '!=', $milestone->id)
                    ->whereBetween('ordre', [$newOrdre, $oldOrdre - 1])
                    ->increment('ordre');
            } else {
                $stage->milestones()
                    ->where('id', '!=', $milestone->id)
                    ->whereBetween('ordre', [$oldOrdre + 1, $newOrdre])
                    ->decrement('ordre');
            }

            $validated['ordre'] = $newOrdre;
        }

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
