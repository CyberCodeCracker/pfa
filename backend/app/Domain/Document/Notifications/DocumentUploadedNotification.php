<?php

namespace App\Domain\Document\Notifications;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class DocumentUploadedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Document $document) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $uploader = $this->document->uploader;
        $uploaderName = $uploader ? $uploader->prenom . ' ' . $uploader->nom : 'Un étudiant';
        return [
            'type'        => 'document_soumis',
            'message'     => $uploaderName . ' a soumis un document : "' . $this->document->nom . '".',
            'document_id' => $this->document->id,
            'stage_id'    => $this->document->stage_id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
