<?php

namespace App\Http\Controllers;

use App\Models\StudentCase;
use Illuminate\Http\Request;

class StudentCaseController extends Controller
{
    // Dean sees everything for their school, INCLUDING removed cases —
    // that visibility is the whole audit-trail point. DH sees only their
    // own active (not-removed) cases; that's their working list.
    public function index(Request $request)
    {
        $query = StudentCase::with(['school', 'program', 'academicPeriod', 'removedBy']);
        $user = $request->user();

        if ($user->role === 'dean') {
            $query->where('school_id', $user->school_id);
        } elseif ($user->role === 'department_head') {
            $query->where('school_id', $user->school_id)
                ->where('program_id', $user->program_id)
                ->whereNull('removed_at');
        }

        return $query->orderByDesc('created_at')->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'academic_period_id' => 'required|exists:academic_periods,id',
            'student_no' => 'required|string|max:30',
            'student_name' => 'required|string',
            'year_level' => 'nullable|string|max:30',
            'section' => 'nullable|string|max:30',
            'birthdate' => 'nullable|date',
            'case_type' => 'required|in:dropout,shift_course,transfer_school',
            'destination' => 'nullable|string',
            'reason' => 'required|string',
        ]);

        $data = StudentCase::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'submitted_by' => $user->id,
            'student_no' => $request->student_no,
            'student_name' => $request->student_name,
            'year_level' => $request->year_level,
            'section' => $request->section,
            'birthdate' => $request->birthdate,
            'case_type' => $request->case_type,
            'destination' => $request->destination,
            'reason' => $request->reason,
        ]);

        return response()->json($data, 201);
    }

    // No update() — cases are immutable once logged. A DH who makes a
    // mistake removes it (while still unlocked) and logs a fresh one.

    public function destroy(Request $request, StudentCase $studentCase)
    {
        $user = $request->user();
        abort_unless($studentCase->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless(
            is_null($studentCase->retention_submission_id),
            403,
            'This case is locked — it has already been included in a submission and can no longer be removed.'
        );

        // Soft delete: we record who removed it and when, never hard-delete.
        $studentCase->update([
            'removed_at' => now(),
            'removed_by' => $user->id,
        ]);

        return response()->json(['message' => 'Removed successfully']);
    }
}
