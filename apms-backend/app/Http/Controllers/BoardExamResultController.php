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
        abort_unless($boardExamResult->status === 'rejected', 403, 'Only rejected submissions can be edited and resubmitted.');

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
            'academic_period_id',
            'total_examinees',
            'total_passers',
            'passing_rate',
            'first_timers',
            'first_timer_passers',
            'first_timer_passing_rate',
            'exam_name',
            'exam_date',
            'notes',
        ]) + [
            'status' => 'pending',
            'rejection_reason' => null,
            'rejected_by' => null,
            'approved_by' => null,
            'approved_at' => null,
            'vpaa_approved_by' => null,
            'vpaa_approved_at' => null,
        ]);

        return response()->json($boardExamResult);
    }

    // Stage 1 — Dean reviews a pending DH submission for their own school.
    public function review(Request $request, BoardExamResult $boardExamResult)
    {
        $user = $request->user();
        abort_unless($boardExamResult->school_id === $user->school_id, 403, 'Not your school.');
        abort_unless($boardExamResult->status === 'pending', 403, 'Only pending submissions can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $boardExamResult->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'approved_by' => $request->status === 'dean_approved' ? $user->id : null,
            'approved_at' => $request->status === 'dean_approved' ? now() : null,
        ]);

        $submittedDate = $boardExamResult->created_at->format('M j, Y');

        if ($request->status === 'dean_approved') {
            $this->notify(
                $boardExamResult->submitted_by,
                'Board Exam Result submission approved',
                "Your Board Exam Result submission from {$submittedDate} was approved by Dean {$user->name}.",
                ['category' => 'board-exam-results', 'record_id' => $boardExamResult->id]
            );
        } else {
            $this->notify(
                $boardExamResult->submitted_by,
                'Board Exam Result submission rejected',
                "Your Board Exam Result submission from {$submittedDate} was rejected by Dean {$user->name}: {$request->rejection_reason}",
                ['category' => 'board-exam-results', 'record_id' => $boardExamResult->id]
            );
        }

        return response()->json($boardExamResult);
    }

    // Stage 2 — VPAA reviews a Dean-approved submission. Approving here
    // is what finally makes it visible on the President's dashboard.
    public function vpaaReview(Request $request, BoardExamResult $boardExamResult)
    {
        $user = $request->user();
        abort_unless($boardExamResult->status === 'dean_approved', 403, 'Only Dean-approved submissions can be reviewed by VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $deanId = $boardExamResult->approved_by; // whoever approved it at the Dean stage

        $boardExamResult->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        $submittedDate = $boardExamResult->created_at->format('M j, Y');

        if ($request->status === 'approved') {
            $this->notify(
                $deanId,
                'Board Exam Result submission approved by VPAA',
                "The Board Exam Result submission from {$submittedDate} that you approved was approved by VPAA {$user->name} and is now visible to the President.",
                ['category' => 'board-exam-results', 'record_id' => $boardExamResult->id]
            );
        } else {
            $this->notify(
                $deanId,
                'Board Exam Result submission needs revision',
                "VPAA {$user->name} sent back the Board Exam Result submission from {$submittedDate} — the Department Head's data needs revision: {$request->rejection_reason}",
                ['category' => 'board-exam-results', 'record_id' => $boardExamResult->id]
            );
            $this->notify(
                $boardExamResult->submitted_by,
                'Your submission needs revision',
                "VPAA sent back your Board Exam Result submission from {$submittedDate} for revision: {$request->rejection_reason}",
                ['category' => 'board-exam-results', 'record_id' => $boardExamResult->id]
            );
        }

        return response()->json($boardExamResult);
    }

    public function destroy(BoardExamResult $boardExamResult)
    {
        $boardExamResult->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
