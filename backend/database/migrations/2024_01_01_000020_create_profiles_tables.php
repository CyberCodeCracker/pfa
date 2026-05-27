<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enseignants_profile', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
            $table->string('grade')->nullable();
            $table->string('specialite')->nullable();
        });

        Schema::create('etudiants_profile', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
            $table->string('niveau')->nullable();
            $table->string('specialite')->nullable();
            $table->string('groupe')->nullable();
            $table->foreignId('etablissement_id')->nullable()->constrained('etablissements')->nullOnDelete();
        });

        Schema::create('enseignant_etablissement', function (Blueprint $table) {
            $table->foreignId('enseignant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->primary(['enseignant_id', 'etablissement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enseignant_etablissement');
        Schema::dropIfExists('etudiants_profile');
        Schema::dropIfExists('enseignants_profile');
    }
};
