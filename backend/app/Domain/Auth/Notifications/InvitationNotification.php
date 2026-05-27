<?php

namespace App\Domain\Auth\Notifications;

use App\Models\Stage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Stage $stage,
        public readonly string $token,
        public readonly string $temporaryPassword,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $invitationUrl = config('app.frontend_url') . '/accepter-invitation/' . $this->token;

        return (new MailMessage)
            ->subject('Invitation au stage : ' . $this->stage->titre)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Vous avez été invité(e) à participer au stage : **' . $this->stage->titre . '**.')
            ->line('Vos identifiants temporaires :')
            ->line('**Email :** ' . $notifiable->email)
            ->line('**Mot de passe temporaire :** ' . $this->temporaryPassword)
            ->action('Accepter l\'invitation', $invitationUrl)
            ->line('Vous serez invité(e) à changer votre mot de passe lors de votre première connexion.')
            ->line('Ce lien est valable 7 jours.');
    }
}
