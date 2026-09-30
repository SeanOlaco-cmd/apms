<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Adds the second (VPAA) approval tier on top of the existing Dean tier.
 *
 * Status flow becomes: pending -> dean_approved -> approved (final,
 * visible to President) -> or rejected at either stage, which always
 * resets to pending for the DH to fix and resubmit.
 *
 * We reuse the existing approved_by/approved_at columns as the
 * "Dean approved this" fields (that's what they already meant in
 * practice) and add new vpaa_approved_by/vpaa_approved_at columns for
 * the second tier, plus rejected_by so a notification can say WHO
 * rejected it.
 */
return new class extends Migration
{
    protected array $tables = [
        'enrollment_data',
        'retention_rates',
        'shiftee_transferee_data',
        'faculty_performance',
        'faculty_achievements',
        'board_exam_results',
        'student_performance',
        'employee_data',
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (! Schema::hasColumn($tableName, 'vpaa_approved_by')) {
                    $table->foreignId('vpaa_approved_by')->nullable()->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn($tableName, 'vpaa_approved_at')) {
                    $table->timestamp('vpaa_approved_at')->nullable();
                }
                if (! Schema::hasColumn($tableName, 'rejected_by')) {
                    $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
                }
            });

            // Widen the status enum to include the new intermediate stage.
            DB::statement("ALTER TABLE `{$tableName}` MODIFY `status` ENUM('pending','dean_approved','approved','rejected') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            DB::statement("ALTER TABLE `{$tableName}` MODIFY `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $cols = array_filter(['vpaa_approved_by', 'vpaa_approved_at', 'rejected_by'], fn($c) => Schema::hasColumn($tableName, $c));
                if ($cols) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};
