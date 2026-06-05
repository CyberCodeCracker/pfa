<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Flagged by the student at upload time. Reports get special handling.
            $table->boolean('is_report')->default(false)->after('parent_document_id');

            // Teacher's PUBLIC comment on a report — visible to the student.
            $table->text('teacher_comment')->nullable()->after('is_report');

            // Teacher's PRIVATE note on a report — never returned to students.
            $table->text('teacher_note')->nullable()->after('teacher_comment');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['is_report', 'teacher_comment', 'teacher_note']);
        });
    }
};
