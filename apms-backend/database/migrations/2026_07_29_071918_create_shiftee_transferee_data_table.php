<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shiftee_transferee_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained()->onDelete('cascade');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('total_shiftees')->default(0);
            $table->integer('shiftees_in')->default(0);
            $table->integer('shiftees_out')->default(0);
            $table->integer('total_transferees')->default(0);
            $table->integer('transferees_in')->default(0);
            $table->integer('transferees_out')->default(0);
            $table->integer('total_dropouts')->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shiftee_transferee_data');
    }
};