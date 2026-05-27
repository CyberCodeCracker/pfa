<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->unique()->constrained('stages')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('private_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enseignant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('etudiant_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['enseignant_id', 'etudiant_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->enum('chat_type', ['public', 'private']);
            $table->unsignedBigInteger('chat_id');
            $table->foreignId('sender_id')->constrained('users')->restrictOnDelete();
            $table->text('contenu');
            $table->string('attachment_path')->nullable();
            $table->string('attachment_mime', 100)->nullable();
            $table->timestamp('edited_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['chat_type', 'chat_id', 'created_at']);
        });

        Schema::create('message_reads', function (Blueprint $table) {
            $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('read_at')->useCurrent();
            $table->primary(['message_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_reads');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('private_chats');
        Schema::dropIfExists('public_chats');
    }
};
