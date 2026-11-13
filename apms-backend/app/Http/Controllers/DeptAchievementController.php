<?php

namespace App\Http\Controllers;

use App\Models\AchievementModule;
use App\Models\DeptAchievement;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Departmental achievements and board exams, recorded by the DEAN and
 * approved by the VPAA. What a school records (TOPCIT, LET passers, ...)
 * comes from its AchievementModule row, so it can be reconfigured later.
 */
class DeptAchievementController extends Controller
{
    // Columns a module's `fields` config may fill in.
    private const FIELD_KEYS = [
        'recipient_name',
        'topcit_level',
        'program_id',
        'year_level',
        'school_year_attended',
        'exam_name',
        'title',
        'date_awarded',
        'notes',
    ];

    public function modules(Request $request)
    {
        $user = $request->user();
        $query = AchievementModule::with('school')->where('is_active', true)->orderBy('sort_order')->orderBy('name');

        if ($user->role === 'dean') {
            $query->where('school_id', $user->school_id);
        }

        return $query->get();
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = DeptAchievement::with(['module', 'school', 'program', 'academicPeriod', 'submitter:id,name'])->latest();

        if ($user->role === 'dean') {
            $query->where('school_id', $user->school_id);
        } elseif ($user->role === 'president') {
            $query->where('status', 'approved');
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'academic_period_id' => 'required|exists:academic_periods,id',
            'module_id' => 'required|exists:achievement_modules,id',
        ]);

        $module = AchievementModule::findOrFail($request->module_id);
        abort_unless((int) $module->school_id === (int) $user->school_id && $module->is_active, 403, 'That module is not available to your school.');

        $values = $this->validatedValues($request, $module, $user);

        $record = DeptAchievement::create($values + [
            'school_id' => $user->school_id,
            'academic_period_id' => $request->academic_period_id,
            'module_id' => $module->id,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        $this->notifyVpaa($user, $module);

        return response()->json($record->load(['module', 'school', 'program', 'academicPeriod']), 201);
    }

    // The Dean corrects a record the VPAA rejected.
    public function resubmit(Request $request, DeptAchievement $deptAchievement)
    {
        $user = $request->user();
        abort_unless($deptAchievement->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless($deptAchievement->status === 'rejected', 403, 'Only rejected records can be edited and resubmitted.');

        $module = $deptAchievement->module;
        $values = $this->validatedValues($request, $module, $user);

        $deptAchievement->update($values + [
            'status' => 'pending',
            'rejection_reason' => null,
            'rejected_by' => null,
            'vpaa_approved_by' => null,
            'vpaa_approved_at' => null,
        ]);

        $this->notifyVpaa($user, $module);

        return response()->json($deptAchievement->load(['module', 'school', 'program', 'academicPeriod']));
    }

    public function vpaaReview(Request $request, DeptAchievement $deptAchievement)
    {
        $user = $request->user();
        abort_unless($deptAchievement->status === 'pending', 403, 'Only pending records can be reviewed.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $ok = $request->status === 'approved';
        $deptAchievement->update([
            'status' => $request->status,
            'rejection_reason' => $ok ? null : $request->rejection_reason,
            'rejected_by' => $ok ? null : $user->id,
            'vpaa_approved_by' => $ok ? $user->id : null,
            'vpaa_approved_at' => $ok ? now() : null,
        ]);

        $this->notify(
            $deptAchievement->submitted_by,
            $ok ? 'Achievement record approved' : 'Achievement record rejected',
            $ok ? "VPAA {$user->name} approved the record for {$deptAchievement->recipient_name}."
                : "VPAA {$user->name} rejected the record for {$deptAchievement->recipient_name}: {$request->rejection_reason}",
            ['category' => 'achievements', 'record_id' => $deptAchievement->id]
        );

        return response()->json($deptAchievement);
    }

    public function destroy(Request $request, DeptAchievement $deptAchievement)
    {
        $user = $request->user();
        abort_unless((int) $deptAchievement->school_id === (int) $user->school_id, 403, 'Not your school.');
        abort_if($deptAchievement->status === 'approved', 403, 'Approved records can no longer be deleted.');

        $deptAchievement->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    /* ------------------------------------------------------------------ */

    // Builds the validation from the module's field list, then checks it.
    private function validatedValues(Request $request, AchievementModule $module, $user): array
    {
        $rules = ['recipient_name' => ['required', 'string', 'max:255']];

        foreach ($module->fields ?? [] as $field) {
            $key = $field['key'] ?? null;
            if (! in_array($key, self::FIELD_KEYS, true)) {
                continue;
            }

            $rule = [($field['required'] ?? false) ? 'required' : 'nullable'];
            switch ($key) {
                case 'topcit_level':
                    array_push($rule, 'integer', 'between:1,5');
                    break;
                case 'program_id':
                    array_push($rule, 'exists:programs,id');
                    break;
                case 'date_awarded':
                    $rule[] = 'date';
                    break;
                case 'year_level':
                    $rule[] = Rule::in(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']);
                    break;
                case 'school_year_attended':
                    array_push($rule, 'string', 'regex:/^\d{4}.\d{4} to \d{4}.\d{4}$/u');
                    break;
                case 'exam_name':
                    $options = collect($field['options'] ?? [])->map(fn($o) => is_array($o) ? ($o['value'] ?? null) : $o)->filter()->values()->all();
                    array_push($rule, 'string', 'max:255');
                    if ($options) {
                        $rule[] = Rule::in($options);
                    }
                    break;
                case 'notes':
                    $rule[] = 'string';
                    break;
                default:
                    array_push($rule, 'string', 'max:255');
            }
            $rules[$key] = $rule;
        }

        $values = Arr::only($request->validate($rules), self::FIELD_KEYS);

        if (! empty($values['program_id'])) {
            $ok = Program::where('id', $values['program_id'])->where('school_id', $user->school_id)->exists();
            if (! $ok) {
                throw ValidationException::withMessages(['program_id' => 'That program is not part of your school.']);
            }
        }

        if (isset($values['recipient_name'])) {
            $values['recipient_name'] = trim($values['recipient_name']);
        }

        return $values;
    }

    private function notifyVpaa($user, AchievementModule $module): void
    {
        User::where('role', 'vpaa')->pluck('id')->each(fn($id) => $this->notify(
            $id,
            "{$module->name} record submitted",
            "Dean {$user->name} submitted a {$module->name} record for approval.",
            ['category' => 'achievements']
        ));
    }
}
