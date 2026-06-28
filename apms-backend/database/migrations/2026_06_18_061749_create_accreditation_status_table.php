<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accreditation_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->string('accrediting_body'); // e.g. ACSCU, PACUCOA
            $table->enum('level', [
                'Level I',
                'Level II',
                'Level III',
                'Level IV',
                'Candidate',
                'Not Accredited'
            ])->default('Not Accredited');
            $table->date('date_accredited')->nullable();
            $table->date('expiry_date')->nullable();
            $table->enum('status', [
                'active',
                'expired',
                'pending',
                'suspended'
            ])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accreditation_status');
    }
};