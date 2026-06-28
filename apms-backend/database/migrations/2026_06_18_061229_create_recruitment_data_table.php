<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recruitment_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained()->onDelete('cascade');
            $table->integer('applicants')->default(0);
            $table->integer('accepted')->default(0);
            $table->integer('enrolled')->default(0);
            $table->integer('walk_in')->default(0);
            $table->integer('online')->default(0);
            $table->integer('referrals')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recruitment_data');
    }
};