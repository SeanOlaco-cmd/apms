<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculty_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained()->onDelete('cascade');
            $table->string('faculty_name');
            $table->string('achievement_title');
            $table->enum('type', [
                'research',
                'publication',
                'award',
                'certification',
                'training',
                'other'
            ])->default('other');
            $table->date('date_awarded')->nullable();
            $table->string('awarding_body')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty_achievements');
    }
};