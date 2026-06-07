<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reunions', function (Blueprint $table) {
            $table->text('compte_rendu')->nullable()->after('statut');
            $table->dateTime('terminated_at')->nullable()->after('compte_rendu');
        });
    }

    public function down(): void
    {
        Schema::table('reunions', function (Blueprint $table) {
            $table->dropColumn(['compte_rendu', 'terminated_at']);
        });
    }
};
