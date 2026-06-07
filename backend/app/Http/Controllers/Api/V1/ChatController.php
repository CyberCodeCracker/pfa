<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Chat\Services\ChatService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\MessageResource;
use App\Http\Resources\V1\PrivateChatResource;
use App\Models\Message;
use App\Models\PrivateChat;
use App\Models\PublicChat;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ChatController extends Controller
{
    public function __construct(private ChatService $chatService) {}

    public function publicMessages(Request $request, PublicChat $publicChat): AnonymousResourceCollection
    {
        $this->chatService->authorizePublicChatAccess($publicChat, $request->user());
        $messages = $this->chatService->getPublicMessages($publicChat);
        return MessageResource::collection($messages);
    }

    public function sendPublicMessage(Request $request, PublicChat $publicChat): JsonResponse
    {
        $request->validate([
            'contenu'    => ['required', 'string', 'max:5000'],
            'attachment' => ['nullable', 'file', 'max:10240'],
        ]);

        $message = $this->chatService->sendPublicMessage(
            $publicChat,
            $request->user(),
            $request->input('contenu'),
            $request->file('attachment'),
        );

        return response()->json(['data' => new MessageResource($message)], 201);
    }

    public function privateConversations(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $chats = PrivateChat::where('enseignant_id', $user->id)
            ->orWhere('etudiant_id', $user->id)
            ->with(['enseignant', 'etudiant'])
            ->get();

        // Attach per-chat unread count for the current user
        $chats->each(function (PrivateChat $chat) use ($user) {
            $chat->unread_count = $this->chatService->unreadCountForChat($chat, $user);
        });

        return PrivateChatResource::collection($chats);
    }

    public function unreadPrivateCount(Request $request): JsonResponse
    {
        return response()->json([
            'data' => ['unread_count' => $this->chatService->totalUnreadPrivate($request->user())],
        ]);
    }

    public function markPrivateChatRead(Request $request, PrivateChat $privateChat): JsonResponse
    {
        $user = $request->user();
        if ($user->id !== $privateChat->enseignant_id && $user->id !== $privateChat->etudiant_id) {
            abort(403);
        }

        $this->chatService->markPrivateChatRead($privateChat, $user);

        return response()->json(['message' => 'Conversation marquée comme lue.']);
    }

    public function startOrGetPrivateChat(Request $request): JsonResponse
    {
        $request->validate(['user_id' => ['required', 'integer', 'exists:users,id']]);

        $otherUser = User::findOrFail($request->input('user_id'));
        $me        = $request->user();

        $enseignant = $me->isEnseignant() ? $me : $otherUser;
        $etudiant   = $me->isEtudiant()   ? $me : $otherUser;

        $chat = $this->chatService->getOrCreatePrivateChat($enseignant, $etudiant);

        return response()->json(['data' => new PrivateChatResource($chat->load(['enseignant', 'etudiant']))]);
    }

    public function privateMessages(Request $request, PrivateChat $privateChat): AnonymousResourceCollection
    {
        $user = $request->user();
        if ($user->id !== $privateChat->enseignant_id && $user->id !== $privateChat->etudiant_id) {
            abort(403);
        }

        $messages = $this->chatService->getPrivateMessages($privateChat);
        return MessageResource::collection($messages);
    }

    public function sendPrivateMessage(Request $request, PrivateChat $privateChat): JsonResponse
    {
        $request->validate([
            'contenu'    => ['required', 'string', 'max:5000'],
            'attachment' => ['nullable', 'file', 'max:10240'],
        ]);

        $message = $this->chatService->sendPrivateMessage(
            $privateChat,
            $request->user(),
            $request->input('contenu'),
            $request->file('attachment'),
        );

        return response()->json(['data' => new MessageResource($message)], 201);
    }

    public function markRead(Request $request, Message $message): JsonResponse
    {
        $this->chatService->markRead($message, $request->user());
        return response()->json(['message' => 'Message marqué comme lu.']);
    }
}
