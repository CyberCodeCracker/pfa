<?php

namespace App\Domain\Document\Services;

use App\Domain\Document\Notifications\DocumentRefusedNotification;
use App\Domain\Document\Notifications\DocumentUploadedNotification;
use App\Domain\Document\Notifications\DocumentValidatedNotification;
use App\Models\Document;
use App\Models\Stage;
use App\Models\User;
use App\Support\Enums\DocumentStatut;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentService
{
    private const ALLOWED_MIMES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip',
        'application/x-zip-compressed',
        'image/png',
        'image/jpeg',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    public function upload(Stage $stage, User $uploader, UploadedFile $file, ?int $parentId = null, bool $isReport = false): Document
    {
        $mime = $file->getMimeType();

        if (!in_array($mime, self::ALLOWED_MIMES)) {
            throw new \InvalidArgumentException('Type de fichier non autorisé.');
        }

        $version = 1;
        if ($parentId) {
            $parent = Document::findOrFail($parentId);
            $version = $parent->version + 1;
        }

        $slug = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $ext  = $file->getClientOriginalExtension();
        $path = "stages/{$stage->id}/documents/" . ($parentId ?? 'new') . "/v{$version}/{$slug}.{$ext}";

        Storage::disk('local')->putFileAs(dirname($path), $file, basename($path));

        $document = Document::create([
            'stage_id'           => $stage->id,
            'uploader_id'        => $uploader->id,
            'nom'                => $file->getClientOriginalName(),
            'fichier'            => $path,
            'mime'               => $mime,
            'taille'             => $file->getSize(),
            'statut'             => DocumentStatut::EnAttente,
            'version'            => $version,
            'parent_document_id' => $parentId,
            'date_upload'        => now(),
            'is_report'          => $isReport,
        ]);

        // Notify the enseignant when a student uploads
        if ($uploader->isEtudiant()) {
            $stage->enseignant?->notify(new DocumentUploadedNotification($document->load('uploader')));
        }

        return $document;
    }

    public function valider(Document $document, User $enseignant): Document
    {
        $document->update(['statut' => DocumentStatut::Valide, 'commentaire' => null]);

        $uploader = $document->uploader;
        if ($uploader && $uploader->isEtudiant()) {
            $uploader->notify(new DocumentValidatedNotification($document));
        }

        return $document;
    }

    public function refuser(Document $document, string $commentaire): Document
    {
        $document->update(['statut' => DocumentStatut::Refuse, 'commentaire' => $commentaire]);

        $uploader = $document->uploader;
        if ($uploader && $uploader->isEtudiant()) {
            $uploader->notify(new DocumentRefusedNotification($document->fresh()));
        }

        return $document;
    }

    public function delete(Document $document): void
    {
        $document->delete();
    }

    /**
     * Teacher annotates a report.
     * - $comment is visible to the student
     * - $note is private to the teacher
     */
    public function annotateReport(Document $document, ?string $comment, ?string $note): Document
    {
        if (!$document->is_report) {
            throw new \InvalidArgumentException('Seuls les rapports peuvent être annotés.');
        }

        $document->update([
            'teacher_comment' => $comment,
            'teacher_note'    => $note,
        ]);

        return $document->fresh();
    }

    public function getSignedDownloadUrl(Document $document): string
    {
        return \URL::temporarySignedRoute(
            'documents.download',
            now()->addMinutes(10),
            ['document' => $document->id]
        );
    }
}
