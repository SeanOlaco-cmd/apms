<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\StudentPerformance;
use Illuminate\Http\Request;

class StudentPerformanceController extends Controller
{
    public function index(Request $request)
    {
        $query = StudentPerformance::with(['school', 'program', 'academicPeriod']);

        if ($request->user()->role === 'dean') {
            $query->where('school_id', $request->user()->school_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'total_students' => 'required|integer',
            'passing' => 'required|integer',
            'failing' => 'required|integer',
            'incomplete' => 'required|integer',
            'dropped' => 'required|integer',
            'passing_rate' => 'required|numeric',
            'average_gwa' => 'required|numeric',
            'latin_honors' => 'required|integer',
        ]);

        $programBelongsToSchool = Program::where('id', $request->program_id)
            ->where('school_id', $request->user()->school_id)
            ->exists();

        if (! $programBelongsToSchool) {
            return response()->json(['message' => 'That program does not belong to your school.'], 422);
        }

        $data = StudentPerformance::create([
            'school_id' => $request->user()->school_id,
            'program_id' => $request->program_id,
            'academic_period_id' => $request->academic_period_id,
            'total_students' => $request->total_students,
            'passing' => $request->passing,
            'failing' => $request->failing,
            'incomplete' => $request->incomplete,
            'dropped' => $request->dropped,
            'passing_rate' => $request->passing_rate,
            'average_gwa' => $request->average_gwa,
            'latin_honors' => $request->latin_honors,
            'notes' => $request->notes,
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(StudentPerformance $studentPerformance)
    {
        return $studentPerformance->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, StudentPerformance $studentPerformance)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $studentPerformance->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $request->user()->id : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        return response()->json($studentPerformance);
    }

    public function destroy(StudentPerformance $studentPerformance)
    {
        $studentPerformance->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}