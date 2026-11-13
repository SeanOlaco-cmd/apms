<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentData;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $query = EnrollmentData::with(['school', 'program', 'academicPeriod']);
        $user = $request->user();

        if ($user->role === 'dean') {
            $query->where('school_id', $user->school_id);
        } elseif ($user->role === 'department_head') {
            $query->where('school_id', $user->school_id)->where('program_id', $user->program_id);
        } elseif ($user->role === 'vpaa') {
            $query->whereIn('status', ['dean_approved', 'approved']);
        } elseif ($user->role === 'president') {
            $query->where('status', 'approved');
        }

        return $query->get();
    }

    private const YEAR_FIELDS = ['y1_new', 'y1_old', 'y2_new', 'y2_old', 'y3_new', 'y3_old', 'y4_new', 'y4_old'];

    /**
     * Validates an enrollment payload and keeps its numbers consistent.
     * When the year-level grid is sent, new_students / old_students are
     * derived from it, so the totals can never disagree with the breakdown.
     */
    private function checkedPayload(Request $request, ?EnrollmentData $existing = null): array
    {
        $req = $existing ? 'sometimes' : 'required';
        $rules = [
            'academic_period_id' => "{$req}|exists:academic_periods,id",
            'total_enrolled' => "{$req}|integer|min:0",
            'male_count' => "{$req}|integer|min:0",
            'female_count' => "{$req}|integer|min:0",
            'new_students' => 'nullable|integer|min:0',
            'old_students' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ];
        foreach (self::YEAR_FIELDS as $field) {
            $rules[$field] = 'nullable|integer|min:0';
        }
        $request->validate($rules);

        $total = (int) $request->input('total_enrolled', $existing->total_enrolled ?? 0);
        $male = (int) $request->input('male_count', $existing->male_count ?? 0);
        $female = (int) $request->input('female_count', $existing->female_count ?? 0);

        if ($male + $female !== $total) {
            throw ValidationException::withMessages(['male_count' => 'Male and female counts must add up to the total enrolled.']);
        }

        $grid = [];
        foreach (self::YEAR_FIELDS as $field) {
            $grid[$field] = (int) $request->input($field, $existing->{$field} ?? 0);
        }
        $hasGrid = collect(self::YEAR_FIELDS)->contains(fn($field) => $request->filled($field));

        if ($hasGrid) {
            $new = $grid['y1_new'] + $grid['y2_new'] + $grid['y3_new'] + $grid['y4_new'];
            $old = $grid['y1_old'] + $grid['y2_old'] + $grid['y3_old'] + $grid['y4_old'];
        } else {
            $new = (int) $request->input('new_students', $existing->new_students ?? 0);
            $old = (int) $request->input('old_students', $existing->old_students ?? 0);
        }

        if ($new + $old !== $total) {
            throw ValidationException::withMessages(['new_students' => 'New and old students (per year level) must add up to the total enrolled.']);
        }

        $payload = [
            'total_enrolled' => $total,
            'male_count' => $male,
            'female_count' => $female,
            'new_students' => $new,
            'old_students' => $old,
            'notes' => $request->input('notes', $existing->notes ?? null),
        ] + $grid;

        if ($request->filled('academic_period_id')) {
            $payload['academic_period_id'] = (int) $request->academic_period_id;
        }

        return $payload;
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->program_id, 422, 'Your account is not assigned to a program.');

        $data = $this->checkedPayload($request);

        $already = EnrollmentData::where('program_id', $user->program_id)
            ->where('academic_period_id', $data['academic_period_id'])->exists();
        if ($already) {
            throw ValidationException::withMessages([
                'academic_period_id' => 'Your program already has an enrollment report for this period. If it was rejected, edit it from your submissions list.',
            ]);
        }

        $record = EnrollmentData::create($data + [
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        User::where('role', 'dean')->where('school_id', $user->school_id)->pluck('id')->each(fn($id) => $this->notify(
            $id,
            'Enrollment report submitted',
            "{$user->name} submitted an enrollment report for your review.",
            ['category' => 'enrollment', 'record_id' => $record->id]
        ));

        return response()->json($record->load(['school', 'program', 'academicPeriod']), 201);
    }

    public function show(EnrollmentData $enrollment)
    {
        return $enrollment->load(['school', 'program', 'academicPeriod']);
    }

    public function resubmit(Request $request, EnrollmentData $enrollment)
    {
        $user = $request->user();
        abort_unless($enrollment->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless($enrollment->status === 'rejected', 403, 'Locked — cannot edit once submitted. Wait for Dean review; you can only edit after a rejection.');

        $data = $this->checkedPayload($request, $enrollment);

        $enrollment->update($data + [
            'status' => 'pending',
            'rejection_reason' => null,
            'rejected_by' => null,
            'approved_by' => null,
            'approved_at' => null,
            'vpaa_approved_by' => null,
            'vpaa_approved_at' => null,
        ]);

        return response()->json($enrollment->load(['school', 'program', 'academicPeriod']));
    }

    // Stage 1 — Dean reviews a pending DH submission for their own school.
    public function review(Request $request, EnrollmentData $enrollment)
    {
        $user = $request->user();
        abort_unless($enrollment->school_id === $user->school_id, 403, 'Not your school.');
        abort_unless($enrollment->status === 'pending', 403, 'Only pending submissions can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $enrollment->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'approved_by' => $request->status === 'dean_approved' ? $user->id : null,
            'approved_at' => $request->status === 'dean_approved' ? now() : null,
        ]);

        $submittedDate = $enrollment->created_at->format('M j, Y');

        if ($request->status === 'dean_approved') {
            $this->notify(
                $enrollment->submitted_by,
                'Enrollment submission approved',
                "Your Enrollment submission from {$submittedDate} was approved by Dean {$user->name}.",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
        } else {
            $this->notify(
                $enrollment->submitted_by,
                'Enrollment submission rejected',
                "Your Enrollment submission from {$submittedDate} was rejected by Dean {$user->name}: {$request->rejection_reason}",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
        }

        return response()->json($enrollment);
    }

    // Stage 2 — VPAA reviews a Dean-approved submission. Approving here
    // is what finally makes it visible on the President's dashboard.
    public function vpaaReview(Request $request, EnrollmentData $enrollment)
    {
        $user = $request->user();
        abort_unless($enrollment->status === 'dean_approved', 403, 'Only Dean-approved submissions can be reviewed by VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $deanId = $enrollment->approved_by; // whoever approved it at the Dean stage

        $enrollment->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        $submittedDate = $enrollment->created_at->format('M j, Y');

        if ($request->status === 'approved') {
            $this->notify(
                $deanId,
                'Enrollment submission approved by VPAA',
                "The Enrollment submission from {$submittedDate} that you approved was approved by VPAA {$user->name} and is now visible to the President.",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
        } else {
            $this->notify(
                $deanId,
                'Enrollment submission needs revision',
                "VPAA {$user->name} sent back the Enrollment submission from {$submittedDate} — the Department Head's data needs revision: {$request->rejection_reason}",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
            $this->notify(
                $enrollment->submitted_by,
                'Your submission needs revision',
                "VPAA sent back your Enrollment submission from {$submittedDate} for revision: {$request->rejection_reason}",
                ['category' => 'enrollment', 'record_id' => $enrollment->id]
            );
        }

        return response()->json($enrollment);
    }

    public function destroy(EnrollmentData $enrollment)
    {
        $enrollment->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
