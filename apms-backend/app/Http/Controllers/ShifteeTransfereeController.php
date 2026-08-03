<?php

namespace App\Http\Controllers;

use App\Models\ShifteeTransfereeData;
use Illuminate\Http\Request;

class ShifteeTransfereeController extends Controller
{
    public function index()
    {
        return ShifteeTransfereeData::with(['school', 'program', 'academicPeriod'])->get();
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
            ...$request->all(),
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);
        return response()->json($data, 201);
    }

    public function show(ShifteeTransfereeData $shifteeTransfereeData)
    {
        return $shifteeTransfereeData->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, ShifteeTransfereeData $shifteeTransfereeData)
    {
        $shifteeTransfereeData->update($request->all());
        return response()->json($shifteeTransfereeData);
    }

    public function destroy(ShifteeTransfereeData $shifteeTransfereeData)
    {
        $shifteeTransfereeData->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}