<?php

namespace App\Http\Controllers;

use App\Models\RetentionRecord;
use App\Models\RetentionReport;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Individual student-movement records (dropped / transferee / shiftee).
 * Department Heads add them; they stay editable drafts until the period's
 * report is submitted (see RetentionReportController).
 */
class RetentionRecordController extends Controller
{
    public const TYPES = ['dropped', 'transferee_in', 'transferee_out', 'shiftee_in', 'shiftee_out'];

    public function index(Request $request)
    {
        $user = $request->user();
        $query = RetentionRecord::with(['report:id,status', 'program', 'school', 'academicPeriod'])
            ->latest('record_date')->latest('id');

        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        switch ($user->role) {
            case 'department_head':
                $query->where('program_id', $user->program_id);
                break;
            case 'dean':
                $query->where('school_id', $user->school_id)->whereNotNull('retention_report_id');
                break;
            case 'vpaa':
                $query->whereHas('report', fn($q) => $q->whereIn('status', ['dean_approved', 'approved']));
                break;
            case 'president':
                $query->whereHas('report', fn($q) => $q->where('status', 'approved'));
                break;
            default:
                $query->whereRaw('1 = 0');
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->program_id, 422, 'Your account is not assigned to a program.');

        $data = $this->validated($request);

        $report = RetentionReport::where('program_id', $user->program_id)
            ->where('academic_period_id', $data['academic_period_id'])->first();
        if ($report && $report->status !== 'rejected') {
            throw ValidationException::withMessages([
                'academic_period_id' => 'The retention report for this period was already submitted, so no more records can be added.',
            ]);
        }

        $duplicate = RetentionRecord::where('program_id', $user->program_id)
            ->where('academic_period_id', $data['academic_period_id'])
            ->where('student_no', $data['student_no'])
            ->where('type', $data['type'])
            ->exists();
        if ($duplicate) {
            throw ValidationException::withMessages([
                'student_no' => 'This student already has a record of that type for the period.',
            ]);
        }

        $record = RetentionRecord::create($data + [
            'school_id' => $user->school_id,
            'program_id' => $user->program_id,
            'retention_report_id' => $report?->id,   // a rejected report takes new records back in
            'recorded_by' => $user->id,
        ]);

        return response()->json($record->load('report:id,status'), 201);
    }

    public function update(Request $request, RetentionRecord $retentionRecord)
    {
        $this->authorizeEdit($request, $retentionRecord);

        $data = $this->validated($request, true);
        unset($data['academic_period_id']);

        $retentionRecord->update($data);

        return response()->json($retentionRecord->load('report:id,status'));
    }

    public function destroy(Request $request, RetentionRecord $retentionRecord)
    {
        $this->authorizeEdit($request, $retentionRecord);
        $retentionRecord->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    private function authorizeEdit(Request $request, RetentionRecord $record): void
    {
        $user = $request->user();
        abort_unless((int) $record->program_id === (int) $user->program_id, 403, 'Not your program.');

        $record->loadMissing('report');
        abort_if($record->report && $record->report->status !== 'rejected', 403, 'This record is part of a submitted report and is locked.');
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'academic_period_id' => "{$req}|exists:academic_periods,id",
            'student_no' => "{$req}|string|max:30",
            'student_name' => "{$req}|string|max:255",
            'type' => "{$req}|in:" . implode(',', self::TYPES),
            'reason' => "{$req}|string|max:255",
            'record_date' => "{$req}|date|before_or_equal:today",
            'notes' => 'nullable|string',
        ]);
    }
}
