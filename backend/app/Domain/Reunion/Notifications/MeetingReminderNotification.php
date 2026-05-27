<?php

namespace App\Domain\Reunion\Notifications;

use App\Models\Reunion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MeetingReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Reunion $reunion,
        public readonly int $hoursUntil,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $label = $this->hoursUntil >= 24 ? 'demain' : 'dans 1 heure';

        return (new MailMessage)
            ->subject('Rappel réunion : ' . $this->reunion->sujet)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Rappel : vous avez une réunion **' . $label . '**.')
            ->line('**Sujet :** ' . $this->reunion->sujet)
            ->line('**Date :** ' . $this->reunion->scheduled_at->format('d/m/Y à H:i'))
            ->when($this->reunion->meet_url, fn ($mail) =>
                $mail->action('Rejoindre Google Meet', $this->reunion->meet_url)
            );
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'meeting_reminder',
            'message'    => 'Rappel : réunion "' . $this->reunion->sujet . '" dans ' . $this->hoursUntil . 'h',
            'reunion_id' => $this->reunion->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
