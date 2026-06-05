<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Widen enum to accept both old and new values during transition
        DB::statement("ALTER TABLE stages MODIFY COLUMN semestre ENUM('S1','S2','ete','pfe','pfa') NULL");

        // S1 → ete
        DB::table('stages')->where('semestre', 'S1')->update(['semestre' => 'ete']);

        // S2 → split 50/50 between pfe and pfa
        DB::table('stages')->where('semestre', 'S2')->whereRaw('id % 2 = 0')->update(['semestre' => 'pfe']);
        DB::table('stages')->where('semestre', 'S2')->whereRaw('id % 2 = 1')->update(['semestre' => 'pfa']);

        // Narrow enum to the three new values
        DB::statement("ALTER TABLE stages MODIFY COLUMN semestre ENUM('ete','pfe','pfa') NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE stages MODIFY COLUMN semestre ENUM('S1','S2','ete','pfe','pfa') NULL");
        DB::table('stages')->where('semestre', 'ete')->update(['semestre' => 'S1']);
        DB::table('stages')->whereIn('semestre', ['pfe', 'pfa'])->update(['semestre' => 'S2']);
        DB::statement("ALTER TABLE stages MODIFY COLUMN semestre ENUM('S1','S2') NULL");
    }
};
