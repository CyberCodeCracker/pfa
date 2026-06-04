<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\EtablissementController;
use App\Http\Controllers\Api\V1\FeedbackController;
use App\Http\Controllers\Api\V1\MilestoneController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ReunionController;
use App\Http\Controllers\Api\V1\StageController;
use Illuminate\Support\Facades\Route;

// ─────────────────────────────────────────────────────────────
// Auth public (rate-limited)
// ─────────────────────────────────────────────────────────────
Route::prefix('v1/auth')->middleware('throttle:auth')->group(function () {
    Route::post('/accept-invitation', [AuthController::class, 'acceptInvitation']);
    Route::post('/forgot-password',   [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',    [AuthController::class, 'resetPassword']);
});

Route::post('/login',  [AuthController::class, 'login'])->middleware('throttle:auth');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// ─────────────────────────────────────────────────────────────
// Authenticated routes
// ─────────────────────────────────────────────────────────────
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Me
    Route::get('/me', [AuthController::class, 'me']);

    // Force password change (must come before force-password-change middleware routes)
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // All routes below require password to not need forced change
    Route::middleware('force.password.change')->group(function () {

        // Etablissements (reference data)
        Route::get('/etablissements', [EtablissementController::class, 'index']);

        // Stages
        Route::apiResource('/stages', StageController::class);
        Route::post('/stages/{stage}/affectations', [StageController::class, 'affecter']);
        Route::delete('/stages/{stage}/affectations/{etudiant}', [StageController::class, 'retirerEtudiant']);

        // Milestones
        Route::get('/stages/{stage}/milestones',           [MilestoneController::class, 'index']);
        Route::post('/stages/{stage}/milestones',          [MilestoneController::class, 'store']);
        Route::patch('/milestones/{milestone}',            [MilestoneController::class, 'update']);
        Route::delete('/milestones/{milestone}',           [MilestoneController::class, 'destroy']);
        Route::post('/milestones/{milestone}/complete',    [MilestoneController::class, 'markComplete']);
        Route::post('/milestones/{milestone}/validate',    [MilestoneController::class, 'validate_']);
        Route::post('/milestones/{milestone}/reopen',      [MilestoneController::class, 'reopen']);

        // Documents
        Route::get('/stages/{stage}/documents',    [DocumentController::class, 'index']);
        Route::post('/stages/{stage}/documents',   [DocumentController::class, 'store']);
        Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
        Route::delete('/documents/{document}',     [DocumentController::class, 'destroy']);
        Route::post('/documents/{document}/valider', [DocumentController::class, 'valider']);
        Route::post('/documents/{document}/refuser', [DocumentController::class, 'refuser']);

        // Feedbacks
        Route::get('/stages/{stage}/feedbacks',  [FeedbackController::class, 'index']);
        Route::post('/stages/{stage}/feedbacks', [FeedbackController::class, 'store']);

        // Réunions
        Route::get('/reunions',                                            [ReunionController::class, 'index']);
        Route::post('/stages/{stage}/reunions',                            [ReunionController::class, 'store']);
        Route::patch('/reunions/{reunion}',                                [ReunionController::class, 'update']);
        Route::post('/reunions/{reunion}/annuler',                         [ReunionController::class, 'annuler']);
        Route::post('/reunions/{reunion}/participants/{user}/reponse',     [ReunionController::class, 'repondre']);

        // Chat public
        Route::get('/chats/public/{publicChat}/messages',  [ChatController::class, 'publicMessages']);
        Route::post('/chats/public/{publicChat}/messages', [ChatController::class, 'sendPublicMessage']);

        // Chat privé
        Route::get('/chats/private',                              [ChatController::class, 'privateConversations']);
        Route::post('/chats/private',                             [ChatController::class, 'startOrGetPrivateChat']);
        Route::get('/chats/private/{privateChat}/messages',       [ChatController::class, 'privateMessages']);
        Route::post('/chats/private/{privateChat}/messages',      [ChatController::class, 'sendPrivateMessage']);

        // Messages
        Route::post('/messages/{message}/read', [ChatController::class, 'markRead']);

        // Notifications
        Route::get('/notifications',           [NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    });
});
