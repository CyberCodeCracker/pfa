<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stages', function (Blueprint $table) {
            $table->string('annee_academique', 9)->nullable()->after('niveau'); // e.g. "2025-2026"
            $table->string('semestre', 2)->nullable()->after('annee_academique'); // "S1" | "S2"
            $table->index(['annee_academique', 'semestre'], 'stages_session_index');
        });
    }

    public function down(): void
    {
        Schema::table('stages', function (Blueprint $table) {
            $table->dropIndex('stages_session_index');
            $table->dropColumn(['annee_academique', 'semestre']);
        });
    }
};
