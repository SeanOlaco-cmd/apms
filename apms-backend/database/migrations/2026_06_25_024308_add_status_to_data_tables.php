<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // These tables don't have status column yet
        $tables = [
            'enrollment_data',
            'recruitment_data',
            'retention_rates',
            'faculty_performance',
            'workforce_needs',
            'faculty_achievements',
            'student_performance',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->text('rejection_reason')->nullable();
                $table->foreignId('submitted_by')->nullable()->constrained('users')->onDelete('set null');
                $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('approved_at')->nullable();
            });
        }

        // These tables already have status column, just add the rest
        $tablesWithStatus = [
            'accreditation_status',
            'corporate_partnerships',
        ];

        foreach ($tablesWithStatus as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->text('rejection_reason')->nullable();
                $table->foreignId('submitted_by')->nullable()->constrained('users')->onDelete('set null');
                $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('approved_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        $tables = [
            'enrollment_data',
            'recruitment_data',
            'retention_rates',
            'faculty_performance',
            'workforce_needs',
            'faculty_achievements',
            'accreditation_status',
            'corporate_partnerships',
            'student_performance',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn(['rejection_reason', 'submitted_by', 'approved_by', 'approved_at']);
            });
        }

        $tablesWithNewStatus = [
            'enrollment_data',
            'recruitment_data',
            'retention_rates',
            'faculty_performance',
            'workforce_needs',
            'faculty_achievements',
            'student_performance',
        ];

        foreach ($tablesWithNewStatus as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};