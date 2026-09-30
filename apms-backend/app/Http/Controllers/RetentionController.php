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
        abort_unless($retention->status === 'rejected', 403, 'Only rejected submissions can be edited and resubmitted.');

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
            'academic_period_id',
            'retention_rate',
            'continuing_students',
            'dropped_students',
            'transferred_students',
            'graduated_students',
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

        $deanId = $retention->approved_by; // whoever approved it at the Dean stage

        $retention->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

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
