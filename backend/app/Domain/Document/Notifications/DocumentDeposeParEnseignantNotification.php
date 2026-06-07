<?php

namespace App\Domain\Document\Notifications;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentDeposeParEnseignantNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Document $document) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $stage = $this->document->stage;

        return (new MailMessage)
            ->subject('Nouveau document déposé : ' . $this->document->nom)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Votre encadreur a déposé un nouveau document sur le stage **' . ($stage?->titre ?? '') . '**.')
            ->line('**Fichier :** ' . $this->document->nom)
            ->line('Connectez-vous pour le consulter dans l\'onglet Documents de votre stage.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'document_depose',
            'message'     => 'Votre encadreur a déposé un document : "' . $this->document->nom . '".',
            'document_id' => $this->document->id,
            'stage_id'    => $this->document->stage_id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
