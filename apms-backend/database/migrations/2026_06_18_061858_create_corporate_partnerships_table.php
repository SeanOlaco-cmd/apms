<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('corporate_partnerships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('industry')->nullable();
            $table->enum('partnership_type', [
                'internship',
                'research',
                'scholarship',
                'employment',
                'training',
                'other'
            ])->default('other');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', [
                'active',
                'expired',
                'pending'
            ])->default('pending');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('corporate_partnerships');
    }
};