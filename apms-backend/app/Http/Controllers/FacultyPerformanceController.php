<?php

namespace App\Http\Controllers;

use App\Models\FacultyPerformance;
use Illuminate\Http\Request;

class FacultyPerformanceController extends Controller
{
    public function index()
    {
        return FacultyPerformance::with(['school', 'academicPeriod'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'total_faculty' => 'required|integer',
            'full_time' => 'required|integer',
            'part_time' => 'required|integer',
            'average_evaluation_score' => 'required|numeric',
            'with_masters' => 'required|integer',
            'with_doctorate' => 'required|integer',
            'with_board_license' => 'required|integer',
        ]);

        $data = FacultyPerformance::create($request->all());
        return response()->json($data, 201);
    }

    public function show(FacultyPerformance $facultyPerformance)
    {
        return $facultyPerformance->load(['school', 'academicPeriod']);
    }

    public function update(Request $request, FacultyPerformance $facultyPerformance)
    {
        $facultyPerformance->update($request->all());
        return response()->json($facultyPerformance);
    }

    public function destroy(FacultyPerformance $facultyPerformance)
    {
        $facultyPerformance->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}