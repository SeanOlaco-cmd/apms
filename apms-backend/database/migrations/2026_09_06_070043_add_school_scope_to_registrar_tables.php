<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Registrar now submits enrollment/retention/shiftee-transferee data
 * college-wide in one go, but Deans need to see only their own school's
 * slice. This adds school_id (and program_id, if useful for finer
 * filtering) to each of those tables if not already present.
 *
 * If these tables already have school_id/program_id (likely, since they
 * were previously scoped to a DH's single program), this migration is a
 * no-op for that column — safe to run either way.
 */
return new class extends Migration
{
    protected array $tables = [
        'enrollment_data',
        'retention_rates',
        'shiftee_transferee_data',
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (! Schema::hasColumn($tableName, 'school_id')) {
                    $table->foreignId('school_id')->nullable()->after('id')->constrained('schools');
                }
                if (! Schema::hasColumn($tableName, 'program_id')) {
                    $table->foreignId('program_id')->nullable()->after('school_id')->constrained('programs');
                }
                if (! Schema::hasColumn($tableName, 'submitted_by')) {
                    $table->foreignId('submitted_by')->nullable()->constrained('users');
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                foreach (['school_id', 'program_id', 'submitted_by'] as $column) {
                    if (Schema::hasColumn($tableName, $column)) {
                        $table->dropConstrainedForeignId($column);
                    }
                }
            });
        }
    }
};