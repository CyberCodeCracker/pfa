<?php

namespace App\Domain\Document\Notifications;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentRefusedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Document $document) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Document refusé : ' . $this->document->nom)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Votre document **"' . $this->document->nom . '"** a été refusé.')
            ->when($this->document->commentaire, fn ($mail) =>
                $mail->line('**Commentaire :** ' . $this->document->commentaire)
            )
            ->line('Veuillez corriger et soumettre à nouveau.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'document_refuse',
            'message'     => 'Votre document "' . $this->document->nom . '" a été refusé.',
            'document_id' => $this->document->id,
            'stage_id'    => $this->document->stage_id,
            'commentaire' => $this->document->commentaire,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
