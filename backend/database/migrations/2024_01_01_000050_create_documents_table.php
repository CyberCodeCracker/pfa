<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained('stages')->cascadeOnDelete();
            $table->foreignId('uploader_id')->constrained('users')->restrictOnDelete();
            $table->string('nom');
            $table->string('fichier');
            $table->string('mime', 100);
            $table->unsignedBigInteger('taille');
            $table->enum('statut', ['en_attente', 'validé', 'refusé'])->default('en_attente');
            $table->text('commentaire')->nullable();
            $table->unsignedSmallInteger('version')->default(1);
            $table->foreignId('parent_document_id')->nullable()->constrained('documents')->nullOnDelete();
            $table->timestamp('date_upload')->useCurrent();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['stage_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
