<?php

namespace App\Http\Controllers;

use App\Models\BoardExamResult;
use Illuminate\Http\Request;

class BoardExamResultController extends Controller
{
    public function index(Request $request)
    {
        $query = BoardExamResult::with(['school', 'program', 'academicPeriod']);

        if ($request->user()->role === 'dean') {
            $query->where('school_id', $request->user()->school_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'total_examinees' => 'required|integer',
            'total_passers' => 'required|integer',
            'passing_rate' => 'required|numeric',
            'first_timers' => 'required|integer',
            'first_timer_passers' => 'required|integer',
            'first_timer_passing_rate' => 'required|numeric',
        ]);

        // Make sure the chosen program actually belongs to the Dean's
        // own school — otherwise a Dean could submit results under a
        // program_id that belongs to a different school.
        $programBelongsToSchool = \App\Models\Program::where('id', $request->program_id)
            ->where('school_id', $request->user()->school_id)
            ->exists();

        if (! $programBelongsToSchool) {
            return response()->json(['message' => 'That program does not belong to your school.'], 422);
        }

        $data = BoardExamResult::create([
            'school_id' => $request->user()->school_id,
            'program_id' => $request->program_id,
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
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(BoardExamResult $boardExamResult)
    {
        return $boardExamResult->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, BoardExamResult $boardExamResult)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $boardExamResult->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $request->user()->id : null,
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