<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculty_performance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained()->onDelete('cascade');
            $table->integer('total_faculty')->default(0);
            $table->integer('full_time')->default(0);
            $table->integer('part_time')->default(0);
            $table->decimal('average_evaluation_score', 5, 2)->default(0);
            $table->integer('with_masters')->default(0);
            $table->integer('with_doctorate')->default(0);
            $table->integer('with_board_license')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty_performance');
    }
};