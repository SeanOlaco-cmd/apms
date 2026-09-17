<?php

namespace App\Http\Controllers;

use App\Models\FacultyPerformance;
use Illuminate\Http\Request;

class FacultyPerformanceController extends Controller
{
    public function index(Request $request)
    {
        $query = FacultyPerformance::with(['school', 'academicPeriod']);
        $user = $request->user();

        if ($user->role === 'dean') {
            $query->where('school_id', $user->school_id);
        } elseif ($user->role === 'department_head') {
            $query->where('school_id', $user->school_id);
            // Note: faculty_performance is school-level (no program_id column),
            // so a DH sees their whole school's faculty performance records,
            // same as before this table gained per-program granularity elsewhere.
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();

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
            'school_id' => $user->school_id,
            'academic_period_id' => $request->academic_period_id,
            'total_faculty' => $request->total_faculty,
            'full_time' => $request->full_time,
            'part_time' => $request->part_time,
            'average_evaluation_score' => $request->average_evaluation_score,
            'with_masters' => $request->with_masters,
            'with_doctorate' => $request->with_doctorate,
            'with_board_license' => $request->with_board_license,
            'notes' => $request->notes,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(FacultyPerformance $facultyPerformance)
    {
        return $facultyPerformance->load(['school', 'academicPeriod']);
    }

    public function resubmit(Request $request, FacultyPerformance $facultyPerformance)
    {
        $user = $request->user();
        abort_unless($facultyPerformance->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless(in_array($facultyPerformance->status, ['pending', 'rejected']), 403, 'Locked — already approved.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'total_faculty' => 'sometimes|integer',
            'full_time' => 'sometimes|integer',
            'part_time' => 'sometimes|integer',
            'average_evaluation_score' => 'sometimes|numeric',
            'with_masters' => 'sometimes|integer',
            'with_doctorate' => 'sometimes|integer',
            'with_board_license' => 'sometimes|integer',
            'notes' => 'sometimes|nullable|string',
        ]);

        $facultyPerformance->update($request->only([
            'academic_period_id', 'total_faculty', 'full_time', 'part_time',
            'average_evaluation_score', 'with_masters', 'with_doctorate', 'with_board_license', 'notes',
        ]) + ['status' => 'pending', 'rejection_reason' => null]);

        return response()->json($facultyPerformance);
    }

    public function review(Request $request, FacultyPerformance $facultyPerformance)
    {
        $user = $request->user();
        abort_unless($facultyPerformance->school_id === $user->school_id, 403, 'Not your school.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $facultyPerformance->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $user->id : null,
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