<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affectations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained('stages')->cascadeOnDelete();
            $table->foreignId('etudiant_id')->constrained('users')->restrictOnDelete();
            $table->date('date_affectation');
            $table->enum('statut', ['invité', 'actif', 'retiré'])->default('invité');
            $table->string('invitation_token')->unique()->nullable();
            $table->timestamp('invitation_sent_at')->nullable();
            $table->timestamp('invitation_accepted_at')->nullable();
            $table->timestamps();

            $table->unique(['stage_id', 'etudiant_id']);
            $table->index(['stage_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affectations');
    }
};
