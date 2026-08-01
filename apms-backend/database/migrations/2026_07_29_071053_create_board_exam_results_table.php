<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('board_exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained()->onDelete('cascade');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('total_examinees')->default(0);
            $table->integer('total_passers')->default(0);
            $table->decimal('passing_rate', 5, 2)->default(0);
            $table->integer('first_timers')->default(0);
            $table->integer('first_timer_passers')->default(0);
            $table->decimal('first_timer_passing_rate', 5, 2)->default(0);
            $table->string('exam_name')->nullable();
            $table->date('exam_date')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('board_exam_results');
    }
};