<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Faculty employment status.
 * The DEAN records it for their own school; the VPAA gives the final approval.
 * (Department Heads no longer handle this.)
 */
class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Employee::with(['school', 'program', 'academicPeriod'])->latest();

        if ($user->role === 'dean') {
            $query->where('school_id', $user->school_id);
        } elseif ($user->role === 'president') {
            $query->where('status', 'approved');
        }
        // VPAA sees every school.

        return $query->get();
    }

    public function show(Request $request, Employee $employee)
    {
        $user = $request->user();
        abort_if($user->role === 'dean' && (int) $employee->school_id !== (int) $user->school_id, 403, 'Not your school.');
        abort_if($user->role === 'president' && $employee->status !== 'approved', 403, 'Not available.');

        return $employee->load(['school', 'program', 'academicPeriod']);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->school_id, 422, 'Your account is not assigned to a school.');

        $data = $this->validated($request, $user);

        $duplicate = Employee::where('school_id', $user->school_id)
            ->where('academic_period_id', $data['academic_period_id'])
            ->whereRaw('LOWER(employee_name) = ?', [mb_strtolower($data['employee_name'])])
            ->exists();
        if ($duplicate) {
            throw ValidationException::withMessages([
                'employee_name' => 'This faculty member is already recorded for the current period.',
            ]);
        }

        $employee = Employee::create($data + [
            'school_id' => $user->school_id,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        $this->notifyVpaa('Faculty record submitted', "Dean {$user->name} submitted a faculty employment record for review.", $employee->id);

        return response()->json($employee->load(['school', 'program', 'academicPeriod']), 201);
    }

    // The Dean fixes and resubmits a record the VPAA rejected.
    public function resubmit(Request $request, Employee $employee)
    {
        $user = $request->user();
        abort_unless($employee->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless($employee->status === 'rejected', 403, 'Only rejected records can be edited and resubmitted.');

        $data = $this->validated($request, $user, true);

        $employee->update($data + [
            'status' => 'pending',
            'rejection_reason' => null,
            'rejected_by' => null,
            'approved_by' => null,
            'approved_at' => null,
            'vpaa_approved_by' => null,
            'vpaa_approved_at' => null,
        ]);

        $this->notifyVpaa('Faculty record resubmitted', "Dean {$user->name} corrected and resubmitted a faculty employment record.", $employee->id);

        return response()->json($employee->load(['school', 'program', 'academicPeriod']));
    }

    // VPAA approves or rejects a Dean-submitted record.
    public function vpaaReview(Request $request, Employee $employee)
    {
        $user = $request->user();
        abort_unless($employee->status === 'pending', 403, 'Only pending records can be reviewed.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $approved = $request->status === 'approved';
        $employee->update([
            'status' => $request->status,
            'rejection_reason' => $approved ? null : $request->rejection_reason,
            'rejected_by' => $approved ? null : $user->id,
            'vpaa_approved_by' => $approved ? $user->id : null,
            'vpaa_approved_at' => $approved ? now() : null,
        ]);

        $this->notify(
            $employee->submitted_by,
            $approved ? 'Faculty record approved' : 'Faculty record rejected',
            $approved
                ? "VPAA {$user->name} approved the faculty record for {$employee->employee_name}."
                : "VPAA {$user->name} rejected the faculty record for {$employee->employee_name}: {$request->rejection_reason}",
            ['category' => 'employees', 'record_id' => $employee->id]
        );

        return response()->json($employee);
    }

    public function destroy(Request $request, Employee $employee)
    {
        $user = $request->user();
        abort_unless((int) $employee->school_id === (int) $user->school_id, 403, 'Not your school.');
        abort_if($employee->status === 'approved', 403, 'Approved records can no longer be deleted.');

        $employee->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    /* ------------------------------------------------------------------ */

    private function validated(Request $request, $user, bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        $data = $request->validate([
            'academic_period_id' => "{$req}|exists:academic_periods,id",
            'employee_name' => "{$req}|string|max:255",
            'employment_type' => "{$req}|in:full_time,part_time",
            'position' => "{$req}|in:department_head,coordinator,dean,faculty",
            'highest_education' => "{$req}|in:bachelors,masters,doctorate",
            'program_id' => 'nullable|exists:programs,id',
            'notes' => 'nullable|string',
        ]);

        if (! empty($data['program_id'])) {
            $belongs = Program::where('id', $data['program_id'])->where('school_id', $user->school_id)->exists();
            if (! $belongs) {
                throw ValidationException::withMessages(['program_id' => 'That program is not part of your school.']);
            }
        }

        if (isset($data['employee_name'])) {
            $data['employee_name'] = trim($data['employee_name']);
        }

        return $data;
    }

    private function notifyVpaa(string $title, string $message, int $recordId): void
    {
        \App\Models\User::where('role', 'vpaa')->pluck('id')->each(fn($id) => $this->notify(
            $id,
            $title,
            $message,
            ['category' => 'employees', 'record_id' => $recordId]
        ));
    }
}
