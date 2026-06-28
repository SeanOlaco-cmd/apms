<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workforce_needs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained()->onDelete('cascade');
            $table->integer('faculty_needed')->default(0);
            $table->integer('vacant_positions')->default(0);
            $table->integer('positions_filled')->default(0);
            $table->string('specialization_needed')->nullable();
            $table->enum('urgency', ['low', 'medium', 'high'])->default('low');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workforce_needs');
    }
};