<?php

namespace App\Http\Controllers;

use App\Models\RetentionRate;
use Illuminate\Http\Request;

class RetentionController extends Controller
{
    public function index(Request $request)
    {
        $query = RetentionRate::with(['school', 'program', 'academicPeriod']);
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
            'retention_rate' => 'required|numeric',
            'continuing_students' => 'required|integer',
            'dropped_students' => 'required|integer',
            'transferred_students' => 'required|integer',
            'graduated_students' => 'required|integer',
        ]);

        $data = RetentionRate::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'retention_rate' => $request->retention_rate,
            'continuing_students' => $request->continuing_students,
            'dropped_students' => $request->dropped_students,
            'transferred_students' => $request->transferred_students,
            'graduated_students' => $request->graduated_students,
            'notes' => $request->notes,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(RetentionRate $retention)
    {
        return $retention->load(['school', 'program', 'academicPeriod']);
    }

    public function resubmit(Request $request, RetentionRate $retention)
    {
        $user = $request->user();
        abort_unless($retention->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless(in_array($retention->status, ['pending', 'rejected']), 403, 'Locked — already approved.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'retention_rate' => 'sometimes|numeric',
            'continuing_students' => 'sometimes|integer',
            'dropped_students' => 'sometimes|integer',
            'transferred_students' => 'sometimes|integer',
            'graduated_students' => 'sometimes|integer',
            'notes' => 'sometimes|nullable|string',
        ]);

        $retention->update($request->only([
            'academic_period_id', 'retention_rate', 'continuing_students',
            'dropped_students', 'transferred_students', 'graduated_students', 'notes',
        ]) + ['status' => 'pending', 'rejection_reason' => null]);

        return response()->json($retention);
    }

    public function review(Request $request, RetentionRate $retention)
    {
        $user = $request->user();
        abort_unless($retention->school_id === $user->school_id, 403, 'Not your school.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $retention->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $user->id : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        return response()->json($retention);
    }

    public function destroy(RetentionRate $retention)
    {
        $retention->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}