<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentData;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $query = EnrollmentData::with(['school', 'program', 'academicPeriod']);

        if ($request->user()->role === 'dean') {
            $query->where('school_id', $request->user()->school_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'program_id' => 'required|exists:programs,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'total_enrolled' => 'required|integer',
            'male_count' => 'required|integer',
            'female_count' => 'required|integer',
            'new_students' => 'required|integer',
            'old_students' => 'required|integer',
        ]);

        $data = EnrollmentData::create([
            'school_id' => $request->school_id,
            'program_id' => $request->program_id,
            'academic_period_id' => $request->academic_period_id,
            'total_enrolled' => $request->total_enrolled,
            'male_count' => $request->male_count,
            'female_count' => $request->female_count,
            'new_students' => $request->new_students,
            'old_students' => $request->old_students,
            'notes' => $request->notes,
            'submitted_by' => $request->user()->id,
            'status' => 'approved', // Registrar data bypasses approval
        ]);

        return response()->json($data, 201);
    }

    public function show(EnrollmentData $enrollment)
    {
        return $enrollment->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, EnrollmentData $enrollment)
    {
        $request->validate([
            'school_id' => 'sometimes|exists:schools,id',
            'program_id' => 'sometimes|exists:programs,id',
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'total_enrolled' => 'sometimes|integer',
            'male_count' => 'sometimes|integer',
            'female_count' => 'sometimes|integer',
            'new_students' => 'sometimes|integer',
            'old_students' => 'sometimes|integer',
            'notes' => 'sometimes|nullable|string',
        ]);

        $enrollment->update($request->only([
            'school_id', 'program_id', 'academic_period_id',
            'total_enrolled', 'male_count', 'female_count',
            'new_students', 'old_students', 'notes',
        ]));

        return response()->json($enrollment);
    }

    public function destroy(EnrollmentData $enrollment)
    {
        $enrollment->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}