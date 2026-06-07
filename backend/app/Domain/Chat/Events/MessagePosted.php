<?php

namespace App\Domain\Chat\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessagePosted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Message $message,
        public readonly ?int $stageId = null,
    ) {}

    public function broadcastOn(): array
    {
        if ($this->message->chat_type->value === 'public' && $this->stageId) {
            return [new PresenceChannel("stage.{$this->stageId}")];
        }

        return [new PrivateChannel("chat.{$this->message->chat_id}")];
    }

    public function broadcastAs(): string
    {
        return 'MessagePosted';
    }

    public function broadcastWith(): array
    {
        return [
            'id'              => $this->message->id,
            'chat_type'       => $this->message->chat_type->value,
            'chat_id'         => $this->message->chat_id,
            'contenu'         => $this->message->contenu,
            'attachment_path' => $this->message->attachment_path ? '/api/v1/messages/' . $this->message->id . '/attachment' : null,
            'sender'          => [
                'id'     => $this->message->sender->id,
                'prenom' => $this->message->sender->prenom,
                'nom'    => $this->message->sender->nom,
            ],
            'created_at'      => $this->message->created_at?->toIso8601String(),
        ];
    }
}
