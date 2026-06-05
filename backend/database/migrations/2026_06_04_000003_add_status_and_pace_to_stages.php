<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Expand the statut enum to include 'suspendu'
        DB::statement("ALTER TABLE stages MODIFY COLUMN statut ENUM('brouillon','actif','suspendu','archivé','terminé') NOT NULL DEFAULT 'brouillon'");

        Schema::table('stages', function (Blueprint $table) {
            $table->enum('pace_indicator', ['ahead', 'on_track', 'behind', 'at_risk'])
                  ->nullable()
                  ->after('statut');
        });
    }

    public function down(): void
    {
        Schema::table('stages', function (Blueprint $table) {
            $table->dropColumn('pace_indicator');
        });

        DB::statement("ALTER TABLE stages MODIFY COLUMN statut ENUM('brouillon','actif','archivé','terminé') NOT NULL DEFAULT 'brouillon'");
    }
};
