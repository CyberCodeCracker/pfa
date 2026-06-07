<?php

namespace App\Domain\Chat\Services;

use App\Domain\Chat\Events\MessagePosted;
use App\Models\Message;
use App\Models\MessageRead;
use App\Models\PrivateChat;
use App\Models\PublicChat;
use App\Models\User;
use App\Support\Enums\AffectationStatut;
use App\Support\Enums\ChatType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatService
{
    public function sendPublicMessage(PublicChat $chat, User $sender, string $content, ?\Illuminate\Http\UploadedFile $attachment = null): Message
    {
        $this->authorizePublicChat($chat, $sender);

        $attachmentPath = null;
        $attachmentMime = null;

        if ($attachment) {
            $attachmentPath = "stages/{$chat->stage_id}/chat-attachments/" . Str::uuid() . '.' . $attachment->getClientOriginalExtension();
            Storage::disk('local')->putFileAs(dirname($attachmentPath), $attachment, basename($attachmentPath));
            $attachmentMime = $attachment->getMimeType();
        }

        $message = Message::create([
            'chat_type'       => ChatType::Public,
            'chat_id'         => $chat->id,
            'sender_id'       => $sender->id,
            'contenu'         => $content,
            'attachment_path' => $attachmentPath,
            'attachment_mime' => $attachmentMime,
            'created_at'      => now(),
        ]);

        broadcast(new MessagePosted($message, $chat->stage_id))->toOthers();

        return $message->load('sender');
    }

    public function sendPrivateMessage(PrivateChat $chat, User $sender, string $content, ?\Illuminate\Http\UploadedFile $attachment = null): Message
    {
        if ($sender->id !== $chat->enseignant_id && $sender->id !== $chat->etudiant_id) {
            abort(403, 'Accès refusé à cette conversation privée.');
        }

        $attachmentPath = null;
        $attachmentMime = null;

        if ($attachment) {
            $attachmentPath = "private-chats/{$chat->id}/" . Str::uuid() . '.' . $attachment->getClientOriginalExtension();
            Storage::disk('local')->putFileAs(dirname($attachmentPath), $attachment, basename($attachmentPath));
            $attachmentMime = $attachment->getMimeType();
        }

        $message = Message::create([
            'chat_type'       => ChatType::Private,
            'chat_id'         => $chat->id,
            'sender_id'       => $sender->id,
            'contenu'         => $content,
            'attachment_path' => $attachmentPath,
            'attachment_mime' => $attachmentMime,
            'created_at'      => now(),
        ]);

        broadcast(new MessagePosted($message))->toOthers();

        return $message->load('sender');
    }

    public function getOrCreatePrivateChat(User $enseignant, User $etudiant): PrivateChat
    {
        if (!$enseignant->isEnseignant() || !$etudiant->isEtudiant()) {
            abort(422, 'Le chat privé est réservé aux conversations enseignant ↔ étudiant.');
        }

        return PrivateChat::firstOrCreate([
            'enseignant_id' => $enseignant->id,
            'etudiant_id'   => $etudiant->id,
        ], ['created_at' => now()]);
    }

    public function markRead(Message $message, User $user): void
    {
        MessageRead::firstOrCreate([
            'message_id' => $message->id,
            'user_id'    => $user->id,
        ], ['read_at' => now()]);
    }

    /**
     * Mark every message in a private chat (not sent by $user) as read.
     */
    public function markPrivateChatRead(PrivateChat $chat, User $user): void
    {
        $unreadIds = Message::where('chat_type', ChatType::Private)
            ->where('chat_id', $chat->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNotExists(function ($q) use ($user) {
                $q->selectRaw('1')
                    ->from('message_reads')
                    ->whereColumn('message_reads.message_id', 'messages.id')
                    ->where('message_reads.user_id', $user->id);
            })
            ->pluck('id');

        if ($unreadIds->isEmpty()) {
            return;
        }

        $rows = $unreadIds->map(fn ($id) => [
            'message_id' => $id,
            'user_id'    => $user->id,
            'read_at'    => now(),
        ])->all();

        MessageRead::insertOrIgnore($rows);
    }

    /**
     * Count unread messages for $user in a single private chat.
     */
    public function unreadCountForChat(PrivateChat $chat, User $user): int
    {
        return Message::where('chat_type', ChatType::Private)
            ->where('chat_id', $chat->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNotExists(function ($q) use ($user) {
                $q->selectRaw('1')
                    ->from('message_reads')
                    ->whereColumn('message_reads.message_id', 'messages.id')
                    ->where('message_reads.user_id', $user->id);
            })
            ->count();
    }

    /**
     * Total unread private messages across all of $user's private chats.
     */
    public function totalUnreadPrivate(User $user): int
    {
        $chatIds = PrivateChat::where('enseignant_id', $user->id)
            ->orWhere('etudiant_id', $user->id)
            ->pluck('id');

        if ($chatIds->isEmpty()) {
            return 0;
        }

        return Message::where('chat_type', ChatType::Private)
            ->whereIn('chat_id', $chatIds)
            ->where('sender_id', '!=', $user->id)
            ->whereNotExists(function ($q) use ($user) {
                $q->selectRaw('1')
                    ->from('message_reads')
                    ->whereColumn('message_reads.message_id', 'messages.id')
                    ->where('message_reads.user_id', $user->id);
            })
            ->count();
    }

    public function getPublicMessages(PublicChat $chat, int $perPage = 50): LengthAwarePaginator
    {
        return Message::where('chat_type', ChatType::Public)
            ->where('chat_id', $chat->id)
            ->with('sender')
            ->latest('created_at')
            ->paginate($perPage);
    }

    public function getPrivateMessages(PrivateChat $chat, int $perPage = 50): LengthAwarePaginator
    {
        return Message::where('chat_type', ChatType::Private)
            ->where('chat_id', $chat->id)
            ->with('sender')
            ->latest('created_at')
            ->paginate($perPage);
    }

    public function authorizePublicChatAccess(PublicChat $chat, User $user): void
    {
        $this->authorizePublicChat($chat, $user);
    }

    private function authorizePublicChat(PublicChat $chat, User $user): void
    {
        $stage = $chat->stage;

        $isEnseignant = $stage->enseignant_id === $user->id;
        $isEtudiant   = $stage->affectations()
            ->where('etudiant_id', $user->id)
            ->where('statut', AffectationStatut::Actif)
            ->exists();

        if (!$isEnseignant && !$isEtudiant) {
            abort(403, 'Accès refusé au chat de ce stage.');
        }
    }
}
