<?php

namespace App\Http\Controllers;

use App\Models\StudentCase;
use Illuminate\Http\Request;

class StudentCaseController extends Controller
{
    // Deliberately NOT exposed to vpaa/president — see the migration
    // comment. Only a school's own Dean and the submitting DH can see
    // this personal-data table.
    public function index(Request $request)
    {
        $query = StudentCase::with(['school', 'program', 'academicPeriod']);
        $user = $request->user();

        if ($user->role === 'dean') {
            $query->where('school_id', $user->school_id);
        } elseif ($user->role === 'department_head') {
            $query->where('school_id', $user->school_id)->where('program_id', $user->program_id);
        }

        return $query->orderByDesc('created_at')->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'academic_period_id' => 'required|exists:academic_periods,id',
            'student_no' => 'required|string|max:30',
            'student_name' => 'required|string',
            'year_level' => 'nullable|string|max:30',
            'section' => 'nullable|string|max:30',
            'birthdate' => 'nullable|date',
            'case_type' => 'required|in:dropout,shift_course,transfer_school',
            'destination' => 'nullable|string',
            'reason' => 'required|string',
        ]);

        $data = StudentCase::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'submitted_by' => $user->id,
            'student_no' => $request->student_no,
            'student_name' => $request->student_name,
            'year_level' => $request->year_level,
            'section' => $request->section,
            'birthdate' => $request->birthdate,
            'case_type' => $request->case_type,
            'destination' => $request->destination,
            'reason' => $request->reason,
        ]);

        return response()->json($data, 201);
    }

    public function update(Request $request, StudentCase $studentCase)
    {
        $user = $request->user();
        abort_unless($studentCase->submitted_by === $user->id, 403, 'Not your submission.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'student_no' => 'sometimes|string|max:30',
            'student_name' => 'sometimes|string',
            'year_level' => 'sometimes|nullable|string|max:30',
            'section' => 'sometimes|nullable|string|max:30',
            'birthdate' => 'sometimes|nullable|date',
            'case_type' => 'sometimes|in:dropout,shift_course,transfer_school',
            'destination' => 'sometimes|nullable|string',
            'reason' => 'sometimes|string',
        ]);

        $studentCase->update($request->only([
            'academic_period_id',
            'student_no',
            'student_name',
            'year_level',
            'section',
            'birthdate',
            'case_type',
            'destination',
            'reason',
        ]));

        return response()->json($studentCase);
    }

    public function destroy(Request $request, StudentCase $studentCase)
    {
        abort_unless($studentCase->submitted_by === $request->user()->id, 403, 'Not your submission.');
        $studentCase->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
