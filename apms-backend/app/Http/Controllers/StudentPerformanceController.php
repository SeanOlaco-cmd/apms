<?php

namespace App\Http\Controllers;

use App\Models\StudentPerformance;
use Illuminate\Http\Request;

class StudentPerformanceController extends Controller
{
    public function index()
    {
        return StudentPerformance::with(['school', 'program', 'academicPeriod'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'program_id' => 'required|exists:programs,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'total_students' => 'required|integer',
            'passing' => 'required|integer',
            'failing' => 'required|integer',
            'incomplete' => 'required|integer',
            'dropped' => 'required|integer',
            'passing_rate' => 'required|numeric',
            'average_gwa' => 'required|numeric',
            'latin_honors' => 'required|integer',
        ]);

        $data = StudentPerformance::create($request->all());
        return response()->json($data, 201);
    }

    public function show(StudentPerformance $studentPerformance)
    {
        return $studentPerformance->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, StudentPerformance $studentPerformance)
    {
        $studentPerformance->update($request->all());
        return response()->json($studentPerformance);
    }

    public function destroy(StudentPerformance $studentPerformance)
    {
        $studentPerformance->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}