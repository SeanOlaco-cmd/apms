<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Safety-net migration — only acts if a table genuinely has BOTH
// 'rejection_reason' (the correct, established spelling) and a stray
// 'rejected_reason' duplicate. No-op everywhere else.
return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'student_performance',
            'faculty_performance',
            'faculty_achievements',
            'board_exam_results',
        ];

        foreach ($tables as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $columns = Schema::getColumnListing($table);

            if (in_array('rejection_reason', $columns) && in_array('rejected_reason', $columns)) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropColumn('rejected_reason');
                });
            }
        }
    }

    public function down(): void
    {
        // No-op — we don't want to recreate the duplicate.
    }
};
