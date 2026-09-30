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
        abort_unless($enrollment->status === 'rejected', 403, 'Only rejected submissions can be edited and resubmitted.');

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
            'academic_period_id',
            'total_enrolled',
            'male_count',
            'female_count',
            'new_students',
            'old_students',
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

        return response()->json($enrollment);
    }

    // Stage 1 — Dean reviews a pending DH submission for their own school.
    public function review(Request $request, EnrollmentData $enrollment)
    {
        $user = $request->user();
        abort_unless($enrollment->school_id === $user->school_id, 403, 'Not your school.');
        abort_unless($enrollment->status === 'pending', 403, 'Only pending submissions can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $enrollment->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'approved_by' => $request->status === 'dean_approved' ? $user->id : null,
            'approved_at' => $request->status === 'dean_approved' ? now() : null,
        ]);

        $submittedDate = $enrollment->created_at->format('M j, Y');

        if ($request->status === 'dean_approved') {
            $this->notify(
                $enrollment->submitted_by,
                'Enrollment submission approved',
                "Your Enrollment submission from {$submittedDate} was approved by Dean {$user->name}.",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
        } else {
            $this->notify(
                $enrollment->submitted_by,
                'Enrollment submission rejected',
                "Your Enrollment submission from {$submittedDate} was rejected by Dean {$user->name}: {$request->rejection_reason}",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
        }

        return response()->json($enrollment);
    }

    // Stage 2 — VPAA reviews a Dean-approved submission. Approving here
    // is what finally makes it visible on the President's dashboard.
    public function vpaaReview(Request $request, EnrollmentData $enrollment)
    {
        $user = $request->user();
        abort_unless($enrollment->status === 'dean_approved', 403, 'Only Dean-approved submissions can be reviewed by VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $deanId = $enrollment->approved_by; // whoever approved it at the Dean stage

        $enrollment->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        $submittedDate = $enrollment->created_at->format('M j, Y');

        if ($request->status === 'approved') {
            $this->notify(
                $deanId,
                'Enrollment submission approved by VPAA',
                "The Enrollment submission from {$submittedDate} that you approved was approved by VPAA {$user->name} and is now visible to the President.",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
        } else {
            $this->notify(
                $deanId,
                'Enrollment submission needs revision',
                "VPAA {$user->name} sent back the Enrollment submission from {$submittedDate} — the Department Head's data needs revision: {$request->rejection_reason}",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
            $this->notify(
                $enrollment->submitted_by,
                'Your submission needs revision',
                "VPAA sent back your Enrollment submission from {$submittedDate} for revision: {$request->rejection_reason}",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
        }

        return response()->json($enrollment);
    }

    public function destroy(EnrollmentData $enrollment)
    {
        $enrollment->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
