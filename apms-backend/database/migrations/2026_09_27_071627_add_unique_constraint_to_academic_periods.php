<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Defense-in-depth: the controller already checks for a duplicate
// school_year + semester pair on create, and now on update too, but a
// DB-level constraint protects the data even if some future code path
// bypasses the controller entirely.
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('academic_periods')) {
            return;
        }

        // Guard against a migration failure if duplicate rows already
        // exist from before this constraint existed — keep the oldest
        // row per (school_year, semester) pair and drop the rest.
        $duplicates = DB::table('academic_periods')
            ->select('school_year', 'semester')
            ->groupBy('school_year', 'semester')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $dup) {
            $ids = DB::table('academic_periods')
                ->where('school_year', $dup->school_year)
                ->where('semester', $dup->semester)
                ->orderBy('id')
                ->pluck('id');

            DB::table('academic_periods')
                ->whereIn('id', $ids->slice(1))
                ->delete();
        }

        Schema::table('academic_periods', function (Blueprint $table) {
            $table->unique(['school_year', 'semester'], 'academic_periods_year_semester_unique');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('academic_periods')) {
            return;
        }

        Schema::table('academic_periods', function (Blueprint $table) {
            $table->dropUnique('academic_periods_year_semester_unique');
        });
    }
};
