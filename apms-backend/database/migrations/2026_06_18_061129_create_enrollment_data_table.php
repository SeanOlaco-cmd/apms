<<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollment_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained()->onDelete('cascade');
            $table->integer('total_enrolled')->default(0);
            $table->integer('male_count')->default(0);
            $table->integer('female_count')->default(0);
            $table->integer('new_students')->default(0);
            $table->integer('old_students')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollment_data');
    }
};