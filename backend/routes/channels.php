<?php

use App\Models\PrivateChat;
use App\Models\Stage;
use App\Support\Enums\AffectationStatut;
use Illuminate\Support\Facades\Broadcast;

// Private notification channel per user
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private chat channel (enseignant ↔ étudiant)
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    $chat = PrivateChat::find($chatId);
    return $chat && ($user->id === $chat->enseignant_id || $user->id === $chat->etudiant_id);
});

// Presence channel for a stage (group chat + live updates)
Broadcast::channel('stage.{stageId}', function ($user, $stageId) {
    $stage = Stage::find($stageId);
    if (!$stage) return false;

    if ($stage->enseignant_id === $user->id) {
        return ['id' => $user->id, 'nom' => $user->full_name, 'role' => 'enseignant'];
    }

    $isActive = $stage->affectations()
        ->where('etudiant_id', $user->id)
        ->where('statut', AffectationStatut::Actif)
        ->exists();

    if ($isActive) {
        return ['id' => $user->id, 'nom' => $user->full_name, 'role' => 'etudiant'];
    }

    return false;
});
