<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentData;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index()
    {
        return EnrollmentData::with(['school', 'program', 'academicPeriod'])->get();
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
            ...$request->all(),
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(EnrollmentData $enrollment)
    {
        return $enrollment->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, EnrollmentData $enrollment)
    {
        $enrollment->update($request->all());
        return response()->json($enrollment);
    }

    public function destroy(EnrollmentData $enrollment)
    {
        $enrollment->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}