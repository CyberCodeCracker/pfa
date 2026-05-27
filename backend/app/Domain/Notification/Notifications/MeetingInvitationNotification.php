<?php

namespace App\Domain\Notification\Notifications;

use App\Models\Reunion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MeetingInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Reunion $reunion) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Nouvelle réunion : ' . $this->reunion->sujet)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Une réunion a été planifiée pour le stage : **' . $this->reunion->stage->titre . '**.')
            ->line('**Sujet :** ' . $this->reunion->sujet)
            ->line('**Date :** ' . $this->reunion->scheduled_at->format('d/m/Y à H:i'))
            ->line('**Durée :** ' . $this->reunion->duration_minutes . ' minutes');

        if ($this->reunion->meet_url) {
            $mail->action('Rejoindre sur Google Meet', $this->reunion->meet_url);
        }

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'reunion_planifiee',
            'reunion_id' => $this->reunion->id,
            'sujet'      => $this->reunion->sujet,
            'stage_id'   => $this->reunion->stage_id,
            'date'       => $this->reunion->scheduled_at->toIso8601String(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
