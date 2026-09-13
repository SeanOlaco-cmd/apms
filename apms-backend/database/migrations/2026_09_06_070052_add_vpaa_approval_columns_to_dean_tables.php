<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * These tables previously went through Dean approval (as DH input).
 * Now Dean is the one inputting them, so the approver becomes VPAA.
 * If a `status`/`approved_by` pair already exists (likely, since the
 * old workflow had one), this just ensures the columns exist —
 * the actual "who approves" logic lives in your Policy/Controller,
 * not the schema, so update those separately.
 */
return new class extends Migration
{
    protected array $tables = [
        'student_performance',
        'faculty_performance',
        'faculty_achievements',
        'board_exam_results',
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (! Schema::hasColumn($tableName, 'status')) {
                    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                }
                if (! Schema::hasColumn($tableName, 'approved_by')) {
                    $table->foreignId('approved_by')->nullable()->constrained('users');
                }
                if (! Schema::hasColumn($tableName, 'rejected_reason')) {
                    $table->text('rejected_reason')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        // Intentionally left as a no-op — these columns likely predate
        // this migration under the old DH/Dean workflow, so dropping
        // them on rollback would be destructive to existing data.
    }
};