<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * New table for part-time / full-time employee data, moved from
 * DH's old scope to Dean's new scope. Adjust column names/types
 * to match your actual conventions in the other Dean-owned tables
 * (e.g. faculty_performance) for consistency.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('employee_data')) {
            return;
        }

        Schema::create('employee_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools');
            $table->foreignId('program_id')->nullable()->constrained('programs');
            $table->foreignId('academic_period_id')->constrained('academic_periods');
            $table->string('employee_name');
            $table->string('position')->nullable();
            $table->enum('employment_type', ['full_time', 'part_time']);
            $table->foreignId('submitted_by')->constrained('users');

            // Approval workflow — VPAA approves Dean submissions now.
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->text('rejected_reason')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_data');
    }
};