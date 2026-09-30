<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AcademicPeriodController extends Controller
{
    public function index()
    {
        return AcademicPeriod::orderByDesc('school_year')
            ->orderBy('semester')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_year' => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'semester' => ['required', Rule::in(['1st', '2nd', 'Summer'])],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
        ], [
            'school_year.regex' => 'School year must look like 2026-2027.',
        ]);

        // One school year may only have one of each semester.
        $exists = AcademicPeriod::where('school_year', $validated['school_year'])
            ->where('semester', $validated['semester'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'That school year and semester already exists.',
                'errors' => ['semester' => ['That school year and semester already exists.']],
            ], 422);
        }

        $period = DB::transaction(function () use ($validated) {
            $period = AcademicPeriod::create($validated);

            if ($period->is_active) {
                $this->deactivateOthers($period->id);
            }

            return $period;
        });

        return response()->json($period, 201);
    }

    public function show(AcademicPeriod $academicPeriod)
    {
        return $academicPeriod;
    }

    public function update(Request $request, AcademicPeriod $academicPeriod)
    {
        $validated = $request->validate([
            'school_year' => ['sometimes', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'semester' => ['sometimes', Rule::in(['1st', '2nd', 'Summer'])],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['sometimes', 'boolean'],
        ], [
            'school_year.regex' => 'School year must look like 2026-2027.',
        ]);

        // Check the RESULTING pair (existing values merged with whatever
        // was actually submitted) against every other row — not just
        // whatever field happened to be in this request.
        $resultingYear = $validated['school_year'] ?? $academicPeriod->school_year;
        $resultingSemester = $validated['semester'] ?? $academicPeriod->semester;

        $duplicate = AcademicPeriod::where('school_year', $resultingYear)
            ->where('semester', $resultingSemester)
            ->where('id', '!=', $academicPeriod->id)
            ->exists();

        if ($duplicate) {
            return response()->json([
                'message' => 'That school year and semester already exists.',
                'errors' => ['semester' => ['That school year and semester already exists.']],
            ], 422);
        }

        DB::transaction(function () use ($academicPeriod, $validated) {
            $academicPeriod->update($validated);

            if ($academicPeriod->is_active) {
                $this->deactivateOthers($academicPeriod->id);
            }
        });

        return response()->json($academicPeriod->fresh());
    }

    public function destroy(AcademicPeriod $academicPeriod)
    {
        // Refuse to delete a period that already has data hanging off it,
        // otherwise the foreign keys blow up mid-demo.
        $tables = [
            'enrollment_data',
            'retention_rates',
            'shiftee_transferee_data',
            'faculty_performance',
            'faculty_achievements',
            'board_exam_results',
            'student_performance',
            'class_monitoring',
            'employee_data',
        ];

        foreach ($tables as $table) {
            if (! DB::getSchemaBuilder()->hasTable($table)) {
                continue;
            }

            if (DB::table($table)->where('academic_period_id', $academicPeriod->id)->exists()) {
                return response()->json([
                    'message' => 'This academic period already has submitted records and cannot be deleted.',
                ], 409);
            }
        }

        $academicPeriod->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Only one academic period may be active at a time.
     */
    protected function deactivateOthers(int $keepId): void
    {
        AcademicPeriod::where('id', '!=', $keepId)
            ->where('is_active', true)
            ->update(['is_active' => false]);
    }
}
