<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reunions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained('stages')->cascadeOnDelete();
            $table->foreignId('enseignant_id')->constrained('users')->restrictOnDelete();
            $table->string('sujet');
            $table->text('description')->nullable();
            $table->dateTime('scheduled_at');
            $table->unsignedSmallInteger('duration_minutes')->default(60);
            $table->string('meet_url')->nullable();
            $table->enum('statut', ['planifiée', 'terminée', 'annulée'])->default('planifiée');
            $table->timestamps();

            $table->index(['stage_id', 'scheduled_at']);
        });

        Schema::create('reunion_participants', function (Blueprint $table) {
            $table->foreignId('reunion_id')->constrained('reunions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('statut', ['invité', 'accepté', 'décliné', 'présent', 'absent'])->default('invité');
            $table->primary(['reunion_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reunion_participants');
        Schema::dropIfExists('reunions');
    }
};
