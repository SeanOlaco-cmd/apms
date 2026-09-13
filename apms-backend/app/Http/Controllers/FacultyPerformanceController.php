<?php

namespace App\Http\Controllers;

use App\Models\FacultyPerformance;
use Illuminate\Http\Request;

class FacultyPerformanceController extends Controller
{
    public function index(Request $request)
    {
        $query = FacultyPerformance::with(['school', 'academicPeriod']);

        if ($request->user()->role === 'dean') {
            $query->where('school_id', $request->user()->school_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'academic_period_id' => 'required|exists:academic_periods,id',
            'total_faculty' => 'required|integer',
            'full_time' => 'required|integer',
            'part_time' => 'required|integer',
            'average_evaluation_score' => 'required|numeric',
            'with_masters' => 'required|integer',
            'with_doctorate' => 'required|integer',
            'with_board_license' => 'required|integer',
        ]);

        $data = FacultyPerformance::create([
            'school_id' => $request->user()->school_id, // Dean's own school only
            'academic_period_id' => $request->academic_period_id,
            'total_faculty' => $request->total_faculty,
            'full_time' => $request->full_time,
            'part_time' => $request->part_time,
            'average_evaluation_score' => $request->average_evaluation_score,
            'with_masters' => $request->with_masters,
            'with_doctorate' => $request->with_doctorate,
            'with_board_license' => $request->with_board_license,
            'notes' => $request->notes,
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(FacultyPerformance $facultyPerformance)
    {
        return $facultyPerformance->load(['school', 'academicPeriod']);
    }

    public function update(Request $request, FacultyPerformance $facultyPerformance)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $facultyPerformance->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $request->user()->id : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        return response()->json($facultyPerformance);
    }

    public function destroy(FacultyPerformance $facultyPerformance)
    {
        $facultyPerformance->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}