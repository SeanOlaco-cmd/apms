<?php

namespace App\Http\Controllers;

use App\Models\RetentionRate;
use Illuminate\Http\Request;

class RetentionController extends Controller
{
    public function index(Request $request)
    {
        $query = RetentionRate::with(['school', 'program', 'academicPeriod']);

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
            'retention_rate' => 'required|numeric',
            'continuing_students' => 'required|integer',
            'dropped_students' => 'required|integer',
            'transferred_students' => 'required|integer',
            'graduated_students' => 'required|integer',
        ]);

        $data = RetentionRate::create([
            'school_id' => $request->school_id,
            'program_id' => $request->program_id,
            'academic_period_id' => $request->academic_period_id,
            'retention_rate' => $request->retention_rate,
            'continuing_students' => $request->continuing_students,
            'dropped_students' => $request->dropped_students,
            'transferred_students' => $request->transferred_students,
            'graduated_students' => $request->graduated_students,
            'notes' => $request->notes,
            'submitted_by' => $request->user()->id,
            'status' => 'approved',
        ]);

        return response()->json($data, 201);
    }

    public function show(RetentionRate $retention)
    {
        return $retention->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, RetentionRate $retention)
    {
        $request->validate([
            'school_id' => 'sometimes|exists:schools,id',
            'program_id' => 'sometimes|exists:programs,id',
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'retention_rate' => 'sometimes|numeric',
            'continuing_students' => 'sometimes|integer',
            'dropped_students' => 'sometimes|integer',
            'transferred_students' => 'sometimes|integer',
            'graduated_students' => 'sometimes|integer',
            'notes' => 'sometimes|nullable|string',
        ]);

        $retention->update($request->only([
            'school_id', 'program_id', 'academic_period_id', 'retention_rate',
            'continuing_students', 'dropped_students', 'transferred_students',
            'graduated_students', 'notes',
        ]));

        return response()->json($retention);
    }

    public function destroy(RetentionRate $retention)
    {
        $retention->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}