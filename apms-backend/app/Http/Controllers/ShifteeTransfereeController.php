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
            'total_shiftees' => 'required|integer',
            'shiftees_in' => 'required|integer',
            'shiftees_out' => 'required|integer',
            'total_transferees' => 'required|integer',
            'transferees_in' => 'required|integer',
            'transferees_out' => 'required|integer',
            'total_dropouts' => 'required|integer',
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
        abort_unless($shifteeTransfereeData->status === 'rejected', 403, 'Locked — cannot edit once submitted. Wait for Dean review; you can only edit after a rejection.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'total_shiftees' => 'sometimes|integer',
            'shiftees_in' => 'sometimes|integer',
            'shiftees_out' => 'sometimes|integer',
            'total_transferees' => 'sometimes|integer',
            'transferees_in' => 'sometimes|integer',
            'transferees_out' => 'sometimes|integer',
            'total_dropouts' => 'sometimes|integer',
            'notes' => 'sometimes|nullable|string',
        ]);

        $shifteeTransfereeData->update($request->only([
            'academic_period_id', 'total_shiftees', 'shiftees_in', 'shiftees_out',
            'total_transferees', 'transferees_in', 'transferees_out', 'total_dropouts', 'notes',
        ]) + ['status' => 'pending', 'rejection_reason' => null]);

        return response()->json($shifteeTransfereeData);
    }

    public function review(Request $request, ShifteeTransfereeData $shifteeTransfereeData)
    {
        $user = $request->user();
        abort_unless($shifteeTransfereeData->school_id === $user->school_id, 403, 'Not your school.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $shifteeTransfereeData->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $user->id : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        return response()->json($shifteeTransfereeData);
    }

    public function destroy(ShifteeTransfereeData $shifteeTransfereeData)
    {
        $shifteeTransfereeData->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}