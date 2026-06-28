<?php

namespace App\Http\Controllers;

use App\Models\RetentionRate;
use Illuminate\Http\Request;

class RetentionController extends Controller
{
    public function index()
    {
        return RetentionRate::with(['school', 'program', 'academicPeriod'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'program_id' => 'required|exists:programs,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'retention_rate' => 'required|numeric',
            'continuing_students' => 'required|integer',
            'dropped_students' => 'required|integer',
            'transferred_students' => 'required|integer',
            'graduated_students' => 'required|integer',
        ]);

        $data = RetentionRate::create($request->all());
        return response()->json($data, 201);
    }

    public function show(RetentionRate $retention)
    {
        return $retention->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, RetentionRate $retention)
    {
        $retention->update($request->all());
        return response()->json($retention);
    }

    public function destroy(RetentionRate $retention)
    {
        $retention->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}