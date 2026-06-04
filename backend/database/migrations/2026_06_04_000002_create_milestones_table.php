<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained('stages')->cascadeOnDelete();
            $table->string('titre', 200);
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('ordre');
            $table->enum('statut', ['pending', 'in_progress', 'completed', 'validated'])->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();
            $table->index(['stage_id', 'ordre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('milestones');
    }
};
