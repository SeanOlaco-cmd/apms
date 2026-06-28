<?php

namespace App\Http\Controllers;

use App\Models\WorkforceNeed;
use Illuminate\Http\Request;

class WorkforceController extends Controller
{
    public function index()
    {
        return WorkforceNeed::with(['school', 'academicPeriod'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'faculty_needed' => 'required|integer',
            'vacant_positions' => 'required|integer',
            'positions_filled' => 'required|integer',
            'urgency' => 'required|in:low,medium,high',
        ]);

        $data = WorkforceNeed::create($request->all());
        return response()->json($data, 201);
    }

    public function show(WorkforceNeed $workforce)
    {
        return $workforce->load(['school', 'academicPeriod']);
    }

    public function update(Request $request, WorkforceNeed $workforce)
    {
        $workforce->update($request->all());
        return response()->json($workforce);
    }

    public function destroy(WorkforceNeed $workforce)
    {
        $workforce->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}