<?php

namespace App\Http\Controllers;

use App\Models\FacultyAchievement;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index(Request $request)
    {
        $query = FacultyAchievement::with(['school', 'academicPeriod']);
        $user = $request->user();

        if ($user->role === 'dean' || $user->role === 'department_head') {
            $query->where('school_id', $user->school_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'academic_period_id' => 'required|exists:academic_periods,id',
            'faculty_name' => 'required|string',
            'achievement_title' => 'required|string',
            'type' => 'required|in:research,publication,award,certification,training,other',
        ]);

        $data = FacultyAchievement::create([
            'school_id' => $user->school_id,
            'academic_period_id' => $request->academic_period_id,
            'faculty_name' => $request->faculty_name,
            'achievement_title' => $request->achievement_title,
            'type' => $request->type,
            'date_awarded' => $request->date_awarded,
            'awarding_body' => $request->awarding_body,
            'description' => $request->description,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json($data, 201);
    }

    public function show(FacultyAchievement $achievement)
    {
        return $achievement->load(['school', 'academicPeriod']);
    }

    public function resubmit(Request $request, FacultyAchievement $achievement)
    {
        $user = $request->user();
        abort_unless($achievement->submitted_by === $user->id, 403, 'Not your submission.');
        abort_unless(in_array($achievement->status, ['pending', 'rejected']), 403, 'Locked — already approved.');

        $request->validate([
            'academic_period_id' => 'sometimes|exists:academic_periods,id',
            'faculty_name' => 'sometimes|string',
            'achievement_title' => 'sometimes|string',
            'type' => 'sometimes|in:research,publication,award,certification,training,other',
            'date_awarded' => 'sometimes|nullable|date',
            'awarding_body' => 'sometimes|nullable|string',
            'description' => 'sometimes|nullable|string',
        ]);

        $achievement->update($request->only([
            'academic_period_id', 'faculty_name', 'achievement_title', 'type',
            'date_awarded', 'awarding_body', 'description',
        ]) + ['status' => 'pending', 'rejection_reason' => null]);

        return response()->json($achievement);
    }

    public function review(Request $request, FacultyAchievement $achievement)
    {
        $user = $request->user();
        abort_unless($achievement->school_id === $user->school_id, 403, 'Not your school.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $achievement->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'approved_by' => $request->status === 'approved' ? $user->id : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        return response()->json($achievement);
    }

    public function destroy(FacultyAchievement $achievement)
    {
        $achievement->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}