<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'enrollment_data',
            'retention_rates',
            'faculty_performance',
            'faculty_achievements',
            'student_performance',
            'board_exam_results',
            'class_monitoring',
            'shiftee_transferee_data',
        ];

        foreach ($tables as $table) {
            \DB::statement("ALTER TABLE `$table` MODIFY `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        $tables = [
            'enrollment_data',
            'retention_rates',
            'faculty_performance',
            'faculty_achievements',
            'student_performance',
            'board_exam_results',
            'class_monitoring',
            'shiftee_transferee_data',
        ];

        foreach ($tables as $table) {
            \DB::statement("ALTER TABLE `$table` MODIFY `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved'");
        }
    }
};