<?php

namespace App\Domain\Stage\Notifications;

use App\Models\Stage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StageDeadlineNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Stage $stage) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Rappel : fin de stage demain — ' . $this->stage->titre)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Votre stage **' . $this->stage->titre . '** se termine **demain**.')
            ->line('Assurez-vous que tous vos livrables sont soumis avant la date limite.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'     => 'stage_deadline',
            'message'  => 'Votre stage "' . $this->stage->titre . '" se termine demain.',
            'stage_id' => $this->stage->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
