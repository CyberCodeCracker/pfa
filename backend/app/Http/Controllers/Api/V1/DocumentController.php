<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Document\Services\DocumentService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\DocumentResource;
use App\Models\Document;
use App\Models\Stage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DocumentController extends Controller
{
    public function __construct(private DocumentService $documentService) {}

    public function index(Request $request, Stage $stage): AnonymousResourceCollection
    {
        $this->authorize('view', $stage);
        $documents = $stage->documents()->with('uploader')->latest('date_upload')->paginate(20);
        return DocumentResource::collection($documents);
    }

    public function store(Request $request, Stage $stage): JsonResponse
    {
        $this->authorize('view', $stage);

        $request->validate([
            'fichier'             => ['required', 'file', 'max:51200'],
            'parent_document_id'  => ['nullable', 'integer', 'exists:documents,id'],
        ]);

        $document = $this->documentService->upload(
            $stage,
            $request->user(),
            $request->file('fichier'),
            $request->input('parent_document_id'),
        );

        return response()->json(['data' => new DocumentResource($document)], 201);
    }

    public function download(Request $request, Document $document): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $this->authorize('view', $document->stage);

        if (!request()->hasValidSignature()) {
            abort(403, 'Lien de téléchargement invalide ou expiré.');
        }

        return response()->download(storage_path('app/' . $document->fichier), $document->nom);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        $this->authorize('delete', $document->stage);
        $this->documentService->delete($document);
        return response()->json(null, 204);
    }

    public function valider(Request $request, Document $document): JsonResponse
    {
        $this->authorize('update', $document->stage);
        $document = $this->documentService->valider($document, $request->user());
        return response()->json(['data' => new DocumentResource($document)]);
    }

    public function refuser(Request $request, Document $document): JsonResponse
    {
        $this->authorize('update', $document->stage);
        $request->validate(['commentaire' => ['required', 'string']]);
        $document = $this->documentService->refuser($document, $request->input('commentaire'));
        return response()->json(['data' => new DocumentResource($document)]);
    }
}
