<?php

namespace App\Http\Controllers;

use App\Models\RetentionRecord;
use App\Models\RetentionReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The retention report is the unit that gets approved:
 *   DH submits (pending) → Dean approves (dean_approved) → VPAA approves (approved).
 * Either reviewer can send it back (rejected); the DH then edits and resubmits.
 */
class RetentionReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = RetentionReport::with(['school', 'program', 'academicPeriod', 'submitter:id,name'])
            ->withCount('records')->latest();
        $this->scope($query, $user);

        $reports = $query->get();

        $perType = RetentionRecord::selectRaw('retention_report_id, type, COUNT(*) as n')
            ->whereIn('retention_report_id', $reports->pluck('id'))
            ->groupBy('retention_report_id', 'type')->get()->groupBy('retention_report_id');

        return $reports->map(fn($r) => array_merge($r->toArray(), [
            'type_counts' => ($perType[$r->id] ?? collect())->pluck('n', 'type'),
        ]));
    }

    public function show(Request $request, RetentionReport $retentionReport)
    {
        $this->authorizeView($request->user(), $retentionReport);

        return $retentionReport->load(['school', 'program', 'academicPeriod', 'submitter:id,name', 'records']);
    }

    // DH submits (or resubmits after a rejection) the period's report.
    public function submit(Request $request)
    {
        $user = $request->user();
        abort_unless($user->program_id, 422, 'Your account is not assigned to a program.');

        $request->validate(['academic_period_id' => 'required|exists:academic_periods,id']);
        $periodId = (int) $request->academic_period_id;

        $report = RetentionReport::where('program_id', $user->program_id)->where('academic_period_id', $periodId)->first();
        if ($report && $report->status !== 'rejected') {
            throw ValidationException::withMessages(['academic_period_id' => 'This period\'s retention report was already submitted.']);
        }

        $drafts = RetentionRecord::where('program_id', $user->program_id)
            ->where('academic_period_id', $periodId)->whereNull('retention_report_id');
        $attached = $report ? $report->records()->count() : 0;
        if ($drafts->count() + $attached === 0) {
            throw ValidationException::withMessages(['academic_period_id' => 'Add at least one retention record before submitting the report.']);
        }

        $report = DB::transaction(function () use ($report, $user, $periodId, $drafts) {
            if ($report) {
                $report->update([
                    'status' => 'pending',
                    'rejection_reason' => null,
                    'rejected_by' => null,
                    'approved_by' => null,
                    'approved_at' => null,
                    'vpaa_approved_by' => null,
                    'vpaa_approved_at' => null,
                ]);
            } else {
                $report = RetentionReport::create([
                    'school_id' => $user->school_id,
                    'program_id' => $user->program_id,
                    'academic_period_id' => $periodId,
                    'submitted_by' => $user->id,
                    'status' => 'pending',
                ]);
            }
            $drafts->update(['retention_report_id' => $report->id]);

            return $report;
        });

        User::where('role', 'dean')->where('school_id', $user->school_id)->pluck('id')->each(fn($id) => $this->notify(
            $id,
            'Retention report submitted',
            "{$user->name} submitted a retention report for your review.",
            ['category' => 'retention', 'record_id' => $report->id]
        ));

        return response()->json($report->load(['school', 'program', 'academicPeriod'])->loadCount('records'), 201);
    }

    // Stage 1 — Dean.
    public function review(Request $request, RetentionReport $retentionReport)
    {
        $user = $request->user();
        abort_unless((int) $retentionReport->school_id === (int) $user->school_id, 403, 'Not your school.');
        abort_unless($retentionReport->status === 'pending', 403, 'Only pending reports can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $ok = $request->status === 'dean_approved';
        $retentionReport->update([
            'status' => $request->status,
            'rejection_reason' => $ok ? null : $request->rejection_reason,
            'rejected_by' => $ok ? null : $user->id,
            'approved_by' => $ok ? $user->id : null,
            'approved_at' => $ok ? now() : null,
        ]);

        $this->notify(
            $retentionReport->submitted_by,
            $ok ? 'Retention report approved' : 'Retention report rejected',
            $ok ? "Dean {$user->name} approved your retention report. It now goes to the VPAA."
                : "Dean {$user->name} rejected your retention report: {$request->rejection_reason}",
            ['category' => 'retention', 'record_id' => $retentionReport->id]
        );

        return response()->json($retentionReport);
    }

    // Stage 2 — VPAA (final).
    public function vpaaReview(Request $request, RetentionReport $retentionReport)
    {
        $user = $request->user();
        abort_unless($retentionReport->status === 'dean_approved', 403, 'Only Dean-approved reports can be reviewed by the VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $ok = $request->status === 'approved';
        $retentionReport->update([
            'status' => $request->status,
            'rejection_reason' => $ok ? null : $request->rejection_reason,
            'rejected_by' => $ok ? null : $user->id,
            'vpaa_approved_by' => $ok ? $user->id : null,
            'vpaa_approved_at' => $ok ? now() : null,
        ]);

        $msg = $ok ? "VPAA {$user->name} approved the retention report." : "VPAA {$user->name} sent back the retention report: {$request->rejection_reason}";
        foreach (array_filter([$retentionReport->submitted_by, $retentionReport->approved_by]) as $id) {
            $this->notify(
                $id,
                $ok ? 'Retention report approved by VPAA' : 'Retention report needs revision',
                $msg,
                ['category' => 'retention', 'record_id' => $retentionReport->id]
            );
        }

        return response()->json($retentionReport);
    }

    /* ------------------------------------------------------------------ */

    private function scope($query, $user): void
    {
        match ($user->role) {
            'department_head' => $query->where('program_id', $user->program_id),
            'dean' => $query->where('school_id', $user->school_id),
            'vpaa' => $query->whereIn('status', ['dean_approved', 'approved']),
            'president' => $query->where('status', 'approved'),
            default => $query->whereRaw('1 = 0'),
        };
    }

    private function authorizeView($user, RetentionReport $report): void
    {
        $allowed = match ($user->role) {
            'department_head' => (int) $report->program_id === (int) $user->program_id,
            'dean' => (int) $report->school_id === (int) $user->school_id,
            'vpaa' => in_array($report->status, ['dean_approved', 'approved'], true),
            'president' => $report->status === 'approved',
            default => false,
        };
        abort_unless($allowed, 403, 'You cannot view this report.');
    }
}
