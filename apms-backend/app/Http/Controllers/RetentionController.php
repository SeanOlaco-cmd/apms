<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentData;
use App\Models\RetentionRate;
use App\Models\StudentCase;
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

    // Dropout cases that make up a NEW submission for this DH and period:
    // active (not removed) AND not already locked to some other submission.
    private function draftDropoutCases($user, $academicPeriodId)
    {
        return StudentCase::where('school_id', $user->school_id)
            ->where('program_id', $user->program_id)
            ->where('academic_period_id', $academicPeriodId)
            ->where('case_type', 'dropout')
            ->whereNull('removed_at')
            ->whereNull('retention_submission_id')
            ->get();
    }

    // Transfer-school cases work the same way and count as "transferred
    // out" — a student transferring to another school is a retention
    // loss for this program. Shift-course cases do NOT count here: that
    // student is still enrolled at CCT, just in a different program, and
    // this table has no column for that distinct case.
    private function draftTransferCases($user, $academicPeriodId)
    {
        return StudentCase::where('school_id', $user->school_id)
            ->where('program_id', $user->program_id)
            ->where('academic_period_id', $academicPeriodId)
            ->where('case_type', 'transfer_school')
            ->whereNull('removed_at')
            ->whereNull('retention_submission_id')
            ->get();
    }

    // continuing = enrolled minus everyone who left for any reason.
    // Retention rate excludes graduates from the denominator — graduating
    // isn't a retention failure, so it shouldn't count against the rate.
    private function computeNumbers($totalEnrolled, $dropped, $transferred, $graduated)
    {
        $continuing = max(0, $totalEnrolled - $dropped - $transferred - $graduated);
        $denominator = $continuing + $dropped + $transferred;
        $rate = $denominator > 0 ? round($continuing / $denominator * 100, 2) : 0;

        return [$continuing, $rate];
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'academic_period_id' => 'required|exists:academic_periods,id',
            'graduated_students' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $enrollment = EnrollmentData::where('school_id', $user->school_id)
            ->where('program_id', $user->program_id)
            ->where('academic_period_id', $request->academic_period_id)
            ->where('status', 'approved')
            ->latest()
            ->first();

        abort_unless($enrollment, 422, 'Enrollment data for this period must be approved by the VPAA before Retention can be submitted.');

        $droppedCases = $this->draftDropoutCases($user, $request->academic_period_id);
        $transferCases = $this->draftTransferCases($user, $request->academic_period_id);
        $dropped = $droppedCases->count();
        $transferred = $transferCases->count();

        [$continuing, $rate] = $this->computeNumbers(
            $enrollment->total_enrolled,
            $dropped,
            $transferred,
            $request->graduated_students
        );

        $data = RetentionRate::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'retention_rate' => $rate,
            'continuing_students' => $continuing,
            'dropped_students' => $dropped,
            'transferred_students' => $transferred,
            'graduated_students' => $request->graduated_students,
            'notes' => $request->notes,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        // Lock both case types to this submission.
        $caseIds = $droppedCases->pluck('id')->merge($transferCases->pluck('id'));
        StudentCase::whereIn('id', $caseIds)->update(['retention_submission_id' => $data->id]);

        return response()->json($data, 201);
    }

    public function show(RetentionRate $retention)
    {
        return $retention->load(['school', 'program', 'academicPeriod']);
    }

    // After a rejection, review()/vpaaReview() below unlock this
    // submission's cases. Resubmitting recomputes from whatever the DH's
    // case list looks like NOW (they may have removed/added cases since
    // the rejection) and re-locks that current set.
    public function resubmit(Request $request, RetentionRate $retention)
    {
        $user = $request->user();
        abort_unless($retention->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless($retention->status === 'rejected', 403, 'Only rejected submissions can be edited and resubmitted.');

        $request->validate([
            'graduated_students' => 'sometimes|integer|min:0',
            'notes' => 'sometimes|nullable|string',
        ]);

        $enrollment = EnrollmentData::where('school_id', $user->school_id)
            ->where('program_id', $user->program_id)
            ->where('academic_period_id', $retention->academic_period_id)
            ->where('status', 'approved')
            ->latest()
            ->first();

        abort_unless($enrollment, 422, 'Enrollment data for this period must be approved by the VPAA before Retention can be resubmitted.');

        $droppedCases = $this->draftDropoutCases($user, $retention->academic_period_id);
        $transferCases = $this->draftTransferCases($user, $retention->academic_period_id);
        $dropped = $droppedCases->count();
        $transferred = $transferCases->count();
        $graduated = $request->input('graduated_students', $retention->graduated_students);

        [$continuing, $rate] = $this->computeNumbers($enrollment->total_enrolled, $dropped, $transferred, $graduated);

        $retention->update([
            'retention_rate' => $rate,
            'continuing_students' => $continuing,
            'dropped_students' => $dropped,
            'transferred_students' => $transferred,
            'graduated_students' => $graduated,
            'notes' => $request->input('notes', $retention->notes),
            'status' => 'pending',
            'rejection_reason' => null,
            'rejected_by' => null,
            'approved_by' => null,
            'approved_at' => null,
            'vpaa_approved_by' => null,
            'vpaa_approved_at' => null,
        ]);

        $caseIds = $droppedCases->pluck('id')->merge($transferCases->pluck('id'));
        StudentCase::whereIn('id', $caseIds)->update(['retention_submission_id' => $retention->id]);

        return response()->json($retention);
    }

    // Stage 1 — Dean reviews a pending DH submission for their own school.
    public function review(Request $request, RetentionRate $retention)
    {
        $user = $request->user();
        abort_unless($retention->school_id === $user->school_id, 403, 'Not your school.');
        abort_unless($retention->status === 'pending', 403, 'Only pending submissions can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $retention->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'approved_by' => $request->status === 'dean_approved' ? $user->id : null,
            'approved_at' => $request->status === 'dean_approved' ? now() : null,
        ]);

        if ($request->status === 'rejected') {
            // Unlock the cases so the DH can fix the list before resubmitting.
            StudentCase::where('retention_submission_id', $retention->id)->update(['retention_submission_id' => null]);
        }

        $submittedDate = $retention->created_at->format('M j, Y');

        if ($request->status === 'dean_approved') {
            $this->notify(
                $retention->submitted_by,
                'Retention submission approved',
                "Your Retention submission from {$submittedDate} was approved by Dean {$user->name}.",
                ['category' => 'retention', 'record_id' => $retention->id]
            );
        } else {
            $this->notify(
                $retention->submitted_by,
                'Retention submission rejected',
                "Your Retention submission from {$submittedDate} was rejected by Dean {$user->name}: {$request->rejection_reason}",
                ['category' => 'retention', 'record_id' => $retention->id]
            );
        }

        return response()->json($retention);
    }

    // Stage 2 — VPAA reviews a Dean-approved submission. Approving here
    // is what finally makes it visible on the President's dashboard.
    public function vpaaReview(Request $request, RetentionRate $retention)
    {
        $user = $request->user();
        abort_unless($retention->status === 'dean_approved', 403, 'Only Dean-approved submissions can be reviewed by VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $deanId = $retention->approved_by;

        $retention->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        if ($request->status === 'rejected') {
            StudentCase::where('retention_submission_id', $retention->id)->update(['retention_submission_id' => null]);
        }

        $submittedDate = $retention->created_at->format('M j, Y');

        if ($request->status === 'approved') {
            $this->notify(
                $deanId,
                'Retention submission approved by VPAA',
                "The Retention submission from {$submittedDate} that you approved was approved by VPAA {$user->name} and is now visible to the President.",
                ['category' => 'retention', 'record_id' => $retention->id]
            );
        } else {
            $this->notify(
                $deanId,
                'Retention submission needs revision',
                "VPAA {$user->name} sent back the Retention submission from {$submittedDate} — the Department Head's data needs revision: {$request->rejection_reason}",
                ['category' => 'retention', 'record_id' => $retention->id]
            );
            $this->notify(
                $retention->submitted_by,
                'Your submission needs revision',
                "VPAA sent back your Retention submission from {$submittedDate} for revision: {$request->rejection_reason}",
                ['category' => 'retention', 'record_id' => $retention->id]
            );
        }

        return response()->json($retention);
    }

    public function destroy(RetentionRate $retention)
    {
        $retention->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
