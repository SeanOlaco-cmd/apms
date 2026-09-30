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
        abort_unless($studentPerformance->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless($studentPerformance->status === 'rejected', 403, 'Only rejected submissions can be edited and resubmitted.');

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
            'academic_period_id',
            'total_students',
            'passing',
            'failing',
            'incomplete',
            'dropped',
            'passing_rate',
            'average_gwa',
            'latin_honors',
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

        return response()->json($studentPerformance);
    }

    // Stage 1 — Dean reviews a pending DH submission for their own school.
    public function review(Request $request, StudentPerformance $studentPerformance)
    {
        $user = $request->user();
        abort_unless($studentPerformance->school_id === $user->school_id, 403, 'Not your school.');
        abort_unless($studentPerformance->status === 'pending', 403, 'Only pending submissions can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $studentPerformance->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'approved_by' => $request->status === 'dean_approved' ? $user->id : null,
            'approved_at' => $request->status === 'dean_approved' ? now() : null,
        ]);

        $submittedDate = $studentPerformance->created_at->format('M j, Y');

        if ($request->status === 'dean_approved') {
            $this->notify(
                $studentPerformance->submitted_by,
                'Student Performance submission approved',
                "Your Student Performance submission from {$submittedDate} was approved by Dean {$user->name}.",
                ['category' => 'student-performance', 'record_id' => $studentPerformance->id]
            );
        } else {
            $this->notify(
                $studentPerformance->submitted_by,
                'Student Performance submission rejected',
                "Your Student Performance submission from {$submittedDate} was rejected by Dean {$user->name}: {$request->rejection_reason}",
                ['category' => 'student-performance', 'record_id' => $studentPerformance->id]
            );
        }

        return response()->json($studentPerformance);
    }

    // Stage 2 — VPAA reviews a Dean-approved submission. Approving here
    // is what finally makes it visible on the President's dashboard.
    public function vpaaReview(Request $request, StudentPerformance $studentPerformance)
    {
        $user = $request->user();
        abort_unless($studentPerformance->status === 'dean_approved', 403, 'Only Dean-approved submissions can be reviewed by VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $deanId = $studentPerformance->approved_by; // whoever approved it at the Dean stage

        $studentPerformance->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        $submittedDate = $studentPerformance->created_at->format('M j, Y');

        if ($request->status === 'approved') {
            $this->notify(
                $deanId,
                'Student Performance submission approved by VPAA',
                "The Student Performance submission from {$submittedDate} that you approved was approved by VPAA {$user->name} and is now visible to the President.",
                ['category' => 'student-performance', 'record_id' => $studentPerformance->id]
            );
        } else {
            $this->notify(
                $deanId,
                'Student Performance submission needs revision',
                "VPAA {$user->name} sent back the Student Performance submission from {$submittedDate} — the Department Head's data needs revision: {$request->rejection_reason}",
                ['category' => 'student-performance', 'record_id' => $studentPerformance->id]
            );
            $this->notify(
                $studentPerformance->submitted_by,
                'Your submission needs revision',
                "VPAA sent back your Student Performance submission from {$submittedDate} for revision: {$request->rejection_reason}",
                ['category' => 'student-performance', 'record_id' => $studentPerformance->id]
            );
        }

        return response()->json($studentPerformance);
    }

    public function destroy(StudentPerformance $studentPerformance)
    {
        $studentPerformance->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
