<?php

namespace App\Http\Controllers;

use App\Models\ShifteeTransfereeData;
use Illuminate\Http\Request;

class ShifteeTransfereeController extends Controller
{
    public function index(Request $request)
    {
        $query = ShifteeTransfereeData::with(['school', 'program', 'academicPeriod']);

        if ($request->user()->role === 'dean') {
            $query->where('school_id', $request->user()->school_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'program_id' => 'required|exists:programs,id',
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
            'school_id' => $request->school_id,
            'program_id' => $request->program_id,
            'academic_period_id' => $request->academic_period_id,
            'total_shiftees' => $request->total_shiftees,
            'shiftees_in' => $request->shiftees_in,
            'shiftees_out' => $request->shiftees_out,
            'total_transferees' => $request->total_transferees,
            'transferees_in' => $request->transferees_in,
            'transferees_out' => $request->transferees_out,
            'total_dropouts' => $request->total_dropouts,
            'notes' => $request->notes,
            'submitted_by' => $request->user()->id,
            'status' => 'approved',
        ]);

        return response()->json($data, 201);
    }

    public function show(ShifteeTransfereeData $shifteeTransfereeData)
    {
        return $shifteeTransfereeData->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, ShifteeTransfereeData $shifteeTransfereeData)
    {
        $request->validate([
            'school_id' => 'sometimes|exists:schools,id',
            'program_id' => 'sometimes|exists:programs,id',
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
            'school_id', 'program_id', 'academic_period_id', 'total_shiftees',
            'shiftees_in', 'shiftees_out', 'total_transferees', 'transferees_in',
            'transferees_out', 'total_dropouts', 'notes',
        ]));

        return response()->json($shifteeTransfereeData);
    }

    public function destroy(ShifteeTransfereeData $shifteeTransfereeData)
    {
        $shifteeTransfereeData->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}