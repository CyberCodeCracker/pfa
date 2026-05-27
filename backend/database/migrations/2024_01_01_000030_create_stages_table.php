<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stages', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->date('date_debut');
            $table->date('date_fin');
            $table->enum('statut', ['brouillon', 'actif', 'archivé', 'terminé'])->default('brouillon');
            $table->string('niveau')->nullable();
            $table->foreignId('etablissement_id')->constrained('etablissements')->restrictOnDelete();
            $table->foreignId('enseignant_id')->constrained('users')->restrictOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['enseignant_id', 'statut']);
            $table->index(['etablissement_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stages');
    }
};
