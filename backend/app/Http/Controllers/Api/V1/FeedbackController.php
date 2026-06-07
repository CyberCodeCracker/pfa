<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Feedback\Notifications\FeedbackReceivedNotification;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\FeedbackResource;
use App\Models\Feedback;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FeedbackController extends Controller
{
    public function index(Request $request, Stage $stage): AnonymousResourceCollection
    {
        $this->authorize('view', $stage);
        $feedbacks = $stage->feedbacks()->with(['enseignant', 'etudiant', 'document'])->latest('created_at')->get();
        return FeedbackResource::collection($feedbacks);
    }

    public function store(Request $request, Stage $stage): JsonResponse
    {
        $this->authorize('update', $stage);

        $validated = $request->validate([
            'etudiant_id'  => ['required', 'integer', 'exists:users,id'],
            'contenu'      => ['required', 'string', 'min:20', 'max:3000'],
            'note'         => ['nullable', 'numeric', 'min:0', 'max:20'],
            'document_id'  => ['nullable', 'integer', 'exists:documents,id'],
        ]);

        $feedback = Feedback::create([
            ...$validated,
            'enseignant_id' => $request->user()->id,
            'stage_id'      => $stage->id,
            'created_at'    => now(),
        ]);

        $feedback->load(['enseignant', 'etudiant']);

        $etudiant = User::find($validated['etudiant_id']);
        if ($etudiant) {
            $etudiant->notify(new FeedbackReceivedNotification($feedback));
        }

        return response()->json(['data' => new FeedbackResource($feedback)], 201);
    }
}
