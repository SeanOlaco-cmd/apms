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
            // faculty_performance/faculty_achievements are school-level (no program_id column)
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
        abort_unless($facultyPerformance->status === 'rejected', 403, 'Only rejected submissions can be edited and resubmitted.');

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
            'academic_period_id',
            'total_faculty',
            'full_time',
            'part_time',
            'average_evaluation_score',
            'with_masters',
            'with_doctorate',
            'with_board_license',
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

        return response()->json($facultyPerformance);
    }

    // Stage 1 — Dean reviews a pending DH submission for their own school.
    public function review(Request $request, FacultyPerformance $facultyPerformance)
    {
        $user = $request->user();
        abort_unless($facultyPerformance->school_id === $user->school_id, 403, 'Not your school.');
        abort_unless($facultyPerformance->status === 'pending', 403, 'Only pending submissions can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $facultyPerformance->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'approved_by' => $request->status === 'dean_approved' ? $user->id : null,
            'approved_at' => $request->status === 'dean_approved' ? now() : null,
        ]);

        $submittedDate = $facultyPerformance->created_at->format('M j, Y');

        if ($request->status === 'dean_approved') {
            $this->notify(
                $facultyPerformance->submitted_by,
                'Faculty Performance submission approved',
                "Your Faculty Performance submission from {$submittedDate} was approved by Dean {$user->name}.",
                ['category' => 'faculty-performance', 'record_id' => $facultyPerformance->id]
            );
        } else {
            $this->notify(
                $facultyPerformance->submitted_by,
                'Faculty Performance submission rejected',
                "Your Faculty Performance submission from {$submittedDate} was rejected by Dean {$user->name}: {$request->rejection_reason}",
                ['category' => 'faculty-performance', 'record_id' => $facultyPerformance->id]
            );
        }

        return response()->json($facultyPerformance);
    }

    // Stage 2 — VPAA reviews a Dean-approved submission. Approving here
    // is what finally makes it visible on the President's dashboard.
    public function vpaaReview(Request $request, FacultyPerformance $facultyPerformance)
    {
        $user = $request->user();
        abort_unless($facultyPerformance->status === 'dean_approved', 403, 'Only Dean-approved submissions can be reviewed by VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $deanId = $facultyPerformance->approved_by; // whoever approved it at the Dean stage

        $facultyPerformance->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        $submittedDate = $facultyPerformance->created_at->format('M j, Y');

        if ($request->status === 'approved') {
            $this->notify(
                $deanId,
                'Faculty Performance submission approved by VPAA',
                "The Faculty Performance submission from {$submittedDate} that you approved was approved by VPAA {$user->name} and is now visible to the President.",
                ['category' => 'faculty-performance', 'record_id' => $facultyPerformance->id]
            );
        } else {
            $this->notify(
                $deanId,
                'Faculty Performance submission needs revision',
                "VPAA {$user->name} sent back the Faculty Performance submission from {$submittedDate} — the Department Head's data needs revision: {$request->rejection_reason}",
                ['category' => 'faculty-performance', 'record_id' => $facultyPerformance->id]
            );
            $this->notify(
                $facultyPerformance->submitted_by,
                'Your submission needs revision',
                "VPAA sent back your Faculty Performance submission from {$submittedDate} for revision: {$request->rejection_reason}",
                ['category' => 'faculty-performance', 'record_id' => $facultyPerformance->id]
            );
        }

        return response()->json($facultyPerformance);
    }

    public function destroy(FacultyPerformance $facultyPerformance)
    {
        $facultyPerformance->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
