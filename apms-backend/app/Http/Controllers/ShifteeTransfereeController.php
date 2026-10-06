<?php

namespace App\Http\Controllers;

use App\Models\ShifteeTransfereeData;
use Illuminate\Http\Request;

class ShifteeTransfereeController extends Controller
{
    public function index(Request $request)
    {
        $query = ShifteeTransfereeData::with(['school', 'program', 'academicPeriod']);
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
            'total_shiftees' => 'required|integer|min:0',
            'shiftees_in' => 'required|integer|min:0',
            'shiftees_out' => 'required|integer|min:0',
            'total_transferees' => 'required|integer|min:0',
            'transferees_in' => 'required|integer|min:0',
            'transferees_out' => 'required|integer|min:0',
            'total_dropouts' => 'required|integer|min:0',
        ]);

        $data = ShifteeTransfereeData::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'total_shiftees' => $request->total_shiftees,
            'shiftees_in' => $request->shiftees_in,
            'shiftees_out' => $request->shiftees_out,
            'total_transferees' => $request->total_transferees,
            'transferees_in' => $request->transferees_in,
            'transferees_out' => $request->transferees_out,
            'total_dropouts' => $request->total_dropouts,
            'notes' => $request->notes,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(ShifteeTransfereeData $shifteeTransfereeData)
    {
        return $shifteeTransfereeData->load(['school', 'program', 'academicPeriod']);
    }

    public function resubmit(Request $request, ShifteeTransfereeData $shifteeTransfereeData)
    {
        $user = $request->user();
        abort_unless($shifteeTransfereeData->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless($shifteeTransfereeData->status === 'rejected', 403, 'Only rejected submissions can be edited and resubmitted.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'total_shiftees' => 'sometimes|integer|min:0',
            'shiftees_in' => 'sometimes|integer|min:0',
            'shiftees_out' => 'sometimes|integer|min:0',
            'total_transferees' => 'sometimes|integer|min:0',
            'transferees_in' => 'sometimes|integer|min:0',
            'transferees_out' => 'sometimes|integer|min:0',
            'total_dropouts' => 'sometimes|integer|min:0',
            'notes' => 'sometimes|nullable|string',
        ]);

        $shifteeTransfereeData->update($request->only([
            'academic_period_id',
            'total_shiftees',
            'shiftees_in',
            'shiftees_out',
            'total_transferees',
            'transferees_in',
            'transferees_out',
            'total_dropouts',
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

        return response()->json($shifteeTransfereeData);
    }

    // Stage 1 — Dean reviews a pending DH submission for their own school.
    public function review(Request $request, ShifteeTransfereeData $shifteeTransfereeData)
    {
        $user = $request->user();
        abort_unless($shifteeTransfereeData->school_id === $user->school_id, 403, 'Not your school.');
        abort_unless($shifteeTransfereeData->status === 'pending', 403, 'Only pending submissions can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $shifteeTransfereeData->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'approved_by' => $request->status === 'dean_approved' ? $user->id : null,
            'approved_at' => $request->status === 'dean_approved' ? now() : null,
        ]);

        $submittedDate = $shifteeTransfereeData->created_at->format('M j, Y');

        if ($request->status === 'dean_approved') {
            $this->notify(
                $shifteeTransfereeData->submitted_by,
                'Shiftee/Transferee submission approved',
                "Your Shiftee/Transferee submission from {$submittedDate} was approved by Dean {$user->name}.",
                ['category' => 'shiftee-transferee', 'record_id' => $shifteeTransfereeData->id]
            );
        } else {
            $this->notify(
                $shifteeTransfereeData->submitted_by,
                'Shiftee/Transferee submission rejected',
                "Your Shiftee/Transferee submission from {$submittedDate} was rejected by Dean {$user->name}: {$request->rejection_reason}",
                ['category' => 'shiftee-transferee', 'record_id' => $shifteeTransfereeData->id]
            );
        }

        return response()->json($shifteeTransfereeData);
    }

    // Stage 2 — VPAA reviews a Dean-approved submission. Approving here
    // is what finally makes it visible on the President's dashboard.
    public function vpaaReview(Request $request, ShifteeTransfereeData $shifteeTransfereeData)
    {
        $user = $request->user();
        abort_unless($shifteeTransfereeData->status === 'dean_approved', 403, 'Only Dean-approved submissions can be reviewed by VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $deanId = $shifteeTransfereeData->approved_by; // whoever approved it at the Dean stage

        $shifteeTransfereeData->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        $submittedDate = $shifteeTransfereeData->created_at->format('M j, Y');

        if ($request->status === 'approved') {
            $this->notify(
                $deanId,
                'Shiftee/Transferee submission approved by VPAA',
                "The Shiftee/Transferee submission from {$submittedDate} that you approved was approved by VPAA {$user->name} and is now visible to the President.",
                ['category' => 'shiftee-transferee', 'record_id' => $shifteeTransfereeData->id]
            );
        } else {
            $this->notify(
                $deanId,
                'Shiftee/Transferee submission needs revision',
                "VPAA {$user->name} sent back the Shiftee/Transferee submission from {$submittedDate} — the Department Head's data needs revision: {$request->rejection_reason}",
                ['category' => 'shiftee-transferee', 'record_id' => $shifteeTransfereeData->id]
            );
            $this->notify(
                $shifteeTransfereeData->submitted_by,
                'Your submission needs revision',
                "VPAA sent back your Shiftee/Transferee submission from {$submittedDate} for revision: {$request->rejection_reason}",
                ['category' => 'shiftee-transferee', 'record_id' => $shifteeTransfereeData->id]
            );
        }

        return response()->json($shifteeTransfereeData);
    }

    public function destroy(ShifteeTransfereeData $shifteeTransfereeData)
    {
        $shifteeTransfereeData->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
