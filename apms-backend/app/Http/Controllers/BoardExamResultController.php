<?php

namespace App\Http\Controllers;

use App\Models\BoardExamResult;
use Illuminate\Http\Request;

class BoardExamResultController extends Controller
{
    public function index(Request $request)
    {
        $query = BoardExamResult::with(['school', 'program', 'academicPeriod']);
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
            'total_examinees' => 'required|integer',
            'total_passers' => 'required|integer',
            'passing_rate' => 'required|numeric',
            'first_timers' => 'required|integer',
            'first_timer_passers' => 'required|integer',
            'first_timer_passing_rate' => 'required|numeric',
        ]);

        $data = BoardExamResult::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'total_examinees' => $request->total_examinees,
            'total_passers' => $request->total_passers,
            'passing_rate' => $request->passing_rate,
            'first_timers' => $request->first_timers,
            'first_timer_passers' => $request->first_timer_passers,
            'first_timer_passing_rate' => $request->first_timer_passing_rate,
            'exam_name' => $request->exam_name,
            'exam_date' => $request->exam_date,
            'notes' => $request->notes,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(BoardExamResult $boardExamResult)
    {
        return $boardExamResult->load(['school', 'program', 'academicPeriod']);
    }

    public function resubmit(Request $request, BoardExamResult $boardExamResult)
    {
        $user = $request->user();
        abort_unless($boardExamResult->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless(in_array($boardExamResult->status, ['pending', 'rejected']), 403, 'Locked — already approved.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'total_examinees' => 'sometimes|integer',
            'total_passers' => 'sometimes|integer',
            'passing_rate' => 'sometimes|numeric',
            'first_timers' => 'sometimes|integer',
            'first_timer_passers' => 'sometimes|integer',
            'first_timer_passing_rate' => 'sometimes|numeric',
            'exam_name' => 'sometimes|nullable|string',
            'exam_date' => 'sometimes|nullable|date',
            'notes' => 'sometimes|nullable|string',
        ]);

        $boardExamResult->update($request->only([
            'academic_period_id', 'total_examinees', 'total_passers', 'passing_rate',
            'first_timers', 'first_timer_passers', 'first_timer_passing_rate',
            'exam_name', 'exam_date', 'notes',
        ]) + ['status' => 'pending', 'rejection_reason' => null]);

        return response()->json($boardExamResult);
    }

    public function review(Request $request, BoardExamResult $boardExamResult)
    {
        $user = $request->user();
        abort_unless($boardExamResult->school_id === $user->school_id, 403, 'Not your school.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $boardExamResult->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $user->id : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        return response()->json($boardExamResult);
    }

    public function destroy(BoardExamResult $boardExamResult)
    {
        $boardExamResult->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}