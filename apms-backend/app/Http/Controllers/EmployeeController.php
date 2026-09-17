<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['school', 'program', 'academicPeriod']);
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
            'employee_name' => 'required|string',
            'position' => 'nullable|string',
            'employment_type' => 'required|in:full_time,part_time',
        ]);

        $data = Employee::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'employee_name' => $request->employee_name,
            'position' => $request->position,
            'employment_type' => $request->employment_type,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(Employee $employee)
    {
        return $employee->load(['school', 'program', 'academicPeriod']);
    }

    public function resubmit(Request $request, Employee $employee)
    {
        $user = $request->user();
        abort_unless($employee->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless(in_array($employee->status, ['pending', 'rejected']), 403, 'Locked — already approved.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'employee_name' => 'sometimes|string',
            'position' => 'sometimes|nullable|string',
            'employment_type' => 'sometimes|in:full_time,part_time',
        ]);

        $employee->update($request->only([
            'academic_period_id', 'employee_name', 'position', 'employment_type',
        ]) + ['status' => 'pending', 'rejection_reason' => null]);

        return response()->json($employee);
    }

    public function review(Request $request, Employee $employee)
    {
        $user = $request->user();
        abort_unless($employee->school_id === $user->school_id, 403, 'Not your school.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $employee->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $user->id : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        return response()->json($employee);
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}