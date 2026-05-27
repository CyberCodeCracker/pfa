<?php

namespace App\Domain\Feedback\Notifications;

use App\Models\Feedback;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class FeedbackReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Feedback $feedback) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $note = $this->feedback->note !== null ? ' (note : ' . $this->feedback->note . '/20)' : '';
        return [
            'type'        => 'feedback_recu',
            'message'     => 'Vous avez reçu un feedback de votre encadreur' . $note . '.',
            'feedback_id' => $this->feedback->id,
            'stage_id'    => $this->feedback->stage_id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
