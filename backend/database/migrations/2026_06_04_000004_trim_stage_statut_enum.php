<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Migrate existing rows so the narrowed enum still accepts every value:
        //   brouillon → actif
        //   archivé   → terminé
        DB::table('stages')->where('statut', 'brouillon')->update(['statut' => 'actif']);
        DB::table('stages')->where('statut', 'archivé')->update(['statut' => 'terminé']);

        // Narrow the enum to the three remaining values.
        DB::statement("ALTER TABLE stages MODIFY COLUMN statut ENUM('actif','suspendu','terminé') NOT NULL DEFAULT 'actif'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE stages MODIFY COLUMN statut ENUM('brouillon','actif','suspendu','archivé','terminé') NOT NULL DEFAULT 'brouillon'");
    }
};
