<?php

namespace App\Domain\Document\Notifications;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentValidatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Document $document) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'document_valide',
            'message'     => 'Votre document "' . $this->document->nom . '" a été validé.',
            'document_id' => $this->document->id,
            'stage_id'    => $this->document->stage_id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
