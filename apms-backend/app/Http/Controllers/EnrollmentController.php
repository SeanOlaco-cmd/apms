<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentData;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $query = EnrollmentData::with(['school', 'program', 'academicPeriod']);
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
            'total_enrolled' => 'required|integer',
            'male_count' => 'required|integer',
            'female_count' => 'required|integer',
            'new_students' => 'required|integer',
            'old_students' => 'required|integer',
        ]);

        $data = EnrollmentData::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'total_enrolled' => $request->total_enrolled,
            'male_count' => $request->male_count,
            'female_count' => $request->female_count,
            'new_students' => $request->new_students,
            'old_students' => $request->old_students,
            'notes' => $request->notes,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(EnrollmentData $enrollment)
    {
        return $enrollment->load(['school', 'program', 'academicPeriod']);
    }

    public function resubmit(Request $request, EnrollmentData $enrollment)
    {
        $user = $request->user();
        abort_unless($enrollment->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless(in_array($enrollment->status, ['pending', 'rejected']), 403, 'Locked — already approved.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'total_enrolled' => 'sometimes|integer',
            'male_count' => 'sometimes|integer',
            'female_count' => 'sometimes|integer',
            'new_students' => 'sometimes|integer',
            'old_students' => 'sometimes|integer',
            'notes' => 'sometimes|nullable|string',
        ]);

        $enrollment->update($request->only([
            'academic_period_id', 'total_enrolled', 'male_count',
            'female_count', 'new_students', 'old_students', 'notes',
        ]) + ['status' => 'pending', 'rejection_reason' => null]);

        return response()->json($enrollment);
    }

    public function review(Request $request, EnrollmentData $enrollment)
    {
        $user = $request->user();
        abort_unless($enrollment->school_id === $user->school_id, 403, 'Not your school.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $enrollment->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $user->id : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        return response()->json($enrollment);
    }

    public function destroy(EnrollmentData $enrollment)
    {
        $enrollment->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}