<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_monitoring', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained()->onDelete('cascade');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('subject_name');
            $table->string('subject_code')->nullable();
            $table->string('instructor_name');
            $table->integer('total_students')->default(0);
            $table->integer('passing')->default(0);
            $table->integer('failing')->default(0);
            $table->integer('incomplete')->default(0);
            $table->integer('dropped')->default(0);
            $table->decimal('passing_rate', 5, 2)->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_monitoring');
    }
};