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
            'employee_no' => 'nullable|string|max:30',
            'position' => 'nullable|string',
            'employment_type' => 'required|in:full_time,part_time',
            'date_hired' => 'nullable|date',
            'highest_education' => 'nullable|string|max:100',
        ]);

        $data = Employee::create([
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'academic_period_id' => $request->academic_period_id,
            'employee_name' => $request->employee_name,
            'employee_no' => $request->employee_no,
            'position' => $request->position,
            'employment_type' => $request->employment_type,
            'date_hired' => $request->date_hired,
            'highest_education' => $request->highest_education,
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
        abort_unless($employee->status === 'rejected', 403, 'Only rejected submissions can be edited and resubmitted.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'employee_name' => 'sometimes|string',
            'employee_no' => 'sometimes|nullable|string|max:30',
            'position' => 'sometimes|nullable|string',
            'employment_type' => 'sometimes|in:full_time,part_time',
            'date_hired' => 'sometimes|nullable|date',
            'highest_education' => 'sometimes|nullable|string|max:100',
        ]);

        $employee->update($request->only([
            'academic_period_id',
            'employee_name',
            'employee_no',
            'position',
            'employment_type',
            'date_hired',
            'highest_education',
        ]) + [
            'status' => 'pending',
            'rejection_reason' => null,
            'rejected_by' => null,
            'approved_by' => null,
            'approved_at' => null,
            'vpaa_approved_by' => null,
            'vpaa_approved_at' => null,
        ]);

        return response()->json($employee);
    }

    // Stage 1 — Dean reviews a pending DH submission for their own school.
    public function review(Request $request, Employee $employee)
    {
        $user = $request->user();
        abort_unless($employee->school_id === $user->school_id, 403, 'Not your school.');
        abort_unless($employee->status === 'pending', 403, 'Only pending submissions can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $employee->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'approved_by' => $request->status === 'dean_approved' ? $user->id : null,
            'approved_at' => $request->status === 'dean_approved' ? now() : null,
        ]);

        $submittedDate = $employee->created_at->format('M j, Y');

        if ($request->status === 'dean_approved') {
            $this->notify(
                $employee->submitted_by,
                'Employee submission approved',
                "Your Employee submission from {$submittedDate} was approved by Dean {$user->name}.",
                ['category' => 'employees', 'record_id' => $employee->id]
            );
        } else {
            $this->notify(
                $employee->submitted_by,
                'Employee submission rejected',
                "Your Employee submission from {$submittedDate} was rejected by Dean {$user->name}: {$request->rejection_reason}",
                ['category' => 'employees', 'record_id' => $employee->id]
            );
        }

        return response()->json($employee);
    }

    // Stage 2 — VPAA reviews a Dean-approved submission. Approving here
    // is what finally makes it visible on the President's dashboard.
    public function vpaaReview(Request $request, Employee $employee)
    {
        $user = $request->user();
        abort_unless($employee->status === 'dean_approved', 403, 'Only Dean-approved submissions can be reviewed by VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $deanId = $employee->approved_by; // whoever approved it at the Dean stage

        $employee->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        $submittedDate = $employee->created_at->format('M j, Y');

        if ($request->status === 'approved') {
            $this->notify(
                $deanId,
                'Employee submission approved by VPAA',
                "The Employee submission from {$submittedDate} that you approved was approved by VPAA {$user->name} and is now visible to the President.",
                ['category' => 'employees', 'record_id' => $employee->id]
            );
        } else {
            // Spec asks that VPAA rejection informs the Dean the DH's data
            // needs revision. We also notify the DH directly, since the DH
            // is the only one who can actually act on it (resubmit()) —
            // without this they'd have no way to know it was sent back.
            $this->notify(
                $deanId,
                'Employee submission needs revision',
                "VPAA {$user->name} sent back the Employee submission from {$submittedDate} — the Department Head's data needs revision: {$request->rejection_reason}",
                ['category' => 'employees', 'record_id' => $employee->id]
            );
            $this->notify(
                $employee->submitted_by,
                'Your submission needs revision',
                "VPAA sent back your Employee submission from {$submittedDate} for revision: {$request->rejection_reason}",
                ['category' => 'employees', 'record_id' => $employee->id]
            );
        }

        return response()->json($employee);
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
