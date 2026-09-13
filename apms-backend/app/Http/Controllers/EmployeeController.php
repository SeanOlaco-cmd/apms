<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['school', 'program', 'academicPeriod']);

        if ($request->user()->role === 'dean') {
            $query->where('school_id', $request->user()->school_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'employee_name' => 'required|string',
            'position' => 'nullable|string',
            'employment_type' => 'required|in:full_time,part_time',
        ]);

        $data = Employee::create([
            'school_id' => $request->user()->school_id, // Dean's own school — never trust client input here
            'program_id' => $request->program_id,
            'academic_period_id' => $request->academic_period_id,
            'employee_name' => $request->employee_name,
            'position' => $request->position,
            'employment_type' => $request->employment_type,
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(Employee $employee)
    {
        return $employee->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $employee->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $request->user()->id : null,
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