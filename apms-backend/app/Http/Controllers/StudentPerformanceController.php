<?php

namespace App\Http\Controllers;

use App\Models\StudentPerformance;
use Illuminate\Http\Request;

class StudentPerformanceController extends Controller
{
    public function index(Request $request)
    {
        $query = StudentPerformance::with(['school', 'program', 'academicPeriod']);
        $user = $request->user();

        if ($user->role === 'dean') {
            $query->where('school_id', $user->school_id);
        } elseif ($user->role === 'department_head') {
            $query->where('school_id', $user->school_id)->where('program_id', $user->program_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
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

        $data = StudentPerformance::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'total_students' => $request->total_students,
            'passing' => $request->passing,
            'failing' => $request->failing,
            'incomplete' => $request->incomplete,
            'dropped' => $request->dropped,
            'passing_rate' => $request->passing_rate,
            'average_gwa' => $request->average_gwa,
            'latin_honors' => $request->latin_honors,
            'notes' => $request->notes,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(StudentPerformance $studentPerformance)
    {
        return $studentPerformance->load(['school', 'program', 'academicPeriod']);
    }

    public function resubmit(Request $request, StudentPerformance $studentPerformance)
    {
        $user = $request->user();
        abort_unless($studentPerformance->status === 'rejected', 403, 'Locked — cannot edit once submitted. Wait for Dean review; you can only edit after a rejection.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'total_students' => 'sometimes|integer',
            'passing' => 'sometimes|integer',
            'failing' => 'sometimes|integer',
            'incomplete' => 'sometimes|integer',
            'dropped' => 'sometimes|integer',
            'passing_rate' => 'sometimes|numeric',
            'average_gwa' => 'sometimes|numeric',
            'latin_honors' => 'sometimes|integer',
            'notes' => 'sometimes|nullable|string',
        ]);

        $studentPerformance->update($request->only([
            'academic_period_id', 'total_students', 'passing', 'failing', 'incomplete',
            'dropped', 'passing_rate', 'average_gwa', 'latin_honors', 'notes',
        ]) + ['status' => 'pending', 'rejection_reason' => null]);

        return response()->json($studentPerformance);
    }

    public function review(Request $request, StudentPerformance $studentPerformance)
    {
        $user = $request->user();
        abort_unless($studentPerformance->school_id === $user->school_id, 403, 'Not your school.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $studentPerformance->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $user->id : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        return response()->json($studentPerformance);
    }

    public function destroy(StudentPerformance $studentPerformance)
    {
        $studentPerformance->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}