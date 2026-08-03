<?php

namespace App\Http\Controllers;

use App\Models\ClassMonitoring;
use Illuminate\Http\Request;

class ClassMonitoringController extends Controller
{
    public function index()
    {
        return ClassMonitoring::with(['school', 'program', 'academicPeriod'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'program_id' => 'required|exists:programs,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'subject_name' => 'required|string',
            'instructor_name' => 'required|string',
            'total_students' => 'required|integer',
            'passing' => 'required|integer',
            'failing' => 'required|integer',
            'incomplete' => 'required|integer',
            'dropped' => 'required|integer',
            'passing_rate' => 'required|numeric',
        ]);

        $data = ClassMonitoring::create([
            ...$request->all(),
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);
        return response()->json($data, 201);
    }

    public function show(ClassMonitoring $classMonitoring)
    {
        return $classMonitoring->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, ClassMonitoring $classMonitoring)
    {
        $classMonitoring->update($request->all());
        return response()->json($classMonitoring);
    }

    public function destroy(ClassMonitoring $classMonitoring)
    {
        $classMonitoring->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}