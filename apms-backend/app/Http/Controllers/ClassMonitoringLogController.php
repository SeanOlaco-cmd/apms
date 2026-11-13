<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use App\Models\ClassMonitoringLog;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Class monitoring, entered by the VPAA: did the instructor hold the class,
 * cancel it, dismiss early, or was the instructor unavailable?
 */
class ClassMonitoringLogController extends Controller
{
    public const VERDICTS = ['complied', 'cancelled_by_instructor', 'early_dismissal', 'instructor_unavailable'];

    public function index(Request $request)
    {
        return ClassMonitoringLog::with(['school', 'program', 'academicPeriod'])
            ->latest('monitored_on')->latest('id')->get();
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        if (empty($data['academic_period_id'])) {
            $active = AcademicPeriod::where('is_active', true)->first();
            if (! $active) {
                throw ValidationException::withMessages(['academic_period_id' => 'There is no active academic period. Ask the System Admin to set one.']);
            }
            $data['academic_period_id'] = $active->id;
        }

        $log = ClassMonitoringLog::create($data + ['recorded_by' => $request->user()->id]);

        return response()->json($log->load(['school', 'program', 'academicPeriod']), 201);
    }

    public function update(Request $request, ClassMonitoringLog $classMonitoringLog)
    {
        $classMonitoringLog->update($this->validated($request, true));

        return response()->json($classMonitoringLog->load(['school', 'program', 'academicPeriod']));
    }

    public function destroy(ClassMonitoringLog $classMonitoringLog)
    {
        $classMonitoringLog->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        $data = $request->validate([
            'academic_period_id' => 'nullable|exists:academic_periods,id',
            'school_id' => "{$req}|exists:schools,id",
            'program_id' => "{$req}|exists:programs,id",
            'instructor_name' => "{$req}|string|max:255",
            'subject_code' => "{$req}|string|max:30",
            'section' => "{$req}|string|max:20",
            'verdict' => "{$req}|in:" . implode(',', self::VERDICTS),
            'minutes_early' => 'nullable|integer|min:1|max:600',
            'monitored_on' => "{$req}|date|before_or_equal:today",
            'remarks' => 'nullable|string',
        ]);

        if (
            isset($data['school_id'], $data['program_id'])
            && ! Program::where('id', $data['program_id'])->where('school_id', $data['school_id'])->exists()
        ) {
            throw ValidationException::withMessages(['program_id' => 'That program does not belong to the selected school.']);
        }

        // Minutes only mean something for an early dismissal.
        if (($data['verdict'] ?? null) && $data['verdict'] !== 'early_dismissal') {
            $data['minutes_early'] = null;
        }

        return $data;
    }
}
