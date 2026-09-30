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

        if ($user->role === 'dean') {
            $query->where('school_id', $user->school_id);
        } elseif ($user->role === 'department_head') {
            $query->where('school_id', $user->school_id);
            // faculty_performance/faculty_achievements are school-level (no program_id column)
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
        abort_unless($achievement->status === 'rejected', 403, 'Only rejected submissions can be edited and resubmitted.');

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
            'academic_period_id',
            'faculty_name',
            'achievement_title',
            'type',
            'date_awarded',
            'awarding_body',
            'description',
        ]) + [
            'status' => 'pending',
            'rejection_reason' => null,
            'rejected_by' => null,
            'approved_by' => null,
            'approved_at' => null,
            'vpaa_approved_by' => null,
            'vpaa_approved_at' => null,
        ]);

        return response()->json($achievement);
    }

    // Stage 1 — Dean reviews a pending DH submission for their own school.
    public function review(Request $request, FacultyAchievement $achievement)
    {
        $user = $request->user();
        abort_unless($achievement->school_id === $user->school_id, 403, 'Not your school.');
        abort_unless($achievement->status === 'pending', 403, 'Only pending submissions can be reviewed.');

        $request->validate([
            'status' => 'required|in:dean_approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $achievement->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'approved_by' => $request->status === 'dean_approved' ? $user->id : null,
            'approved_at' => $request->status === 'dean_approved' ? now() : null,
        ]);

        $submittedDate = $achievement->created_at->format('M j, Y');

        if ($request->status === 'dean_approved') {
            $this->notify(
                $achievement->submitted_by,
                'Achievement submission approved',
                "Your Achievement submission from {$submittedDate} was approved by Dean {$user->name}.",
                ['category' => 'achievements', 'record_id' => $achievement->id]
            );
        } else {
            $this->notify(
                $achievement->submitted_by,
                'Achievement submission rejected',
                "Your Achievement submission from {$submittedDate} was rejected by Dean {$user->name}: {$request->rejection_reason}",
                ['category' => 'achievements', 'record_id' => $achievement->id]
            );
        }

        return response()->json($achievement);
    }

    // Stage 2 — VPAA reviews a Dean-approved submission. Approving here
    // is what finally makes it visible on the President's dashboard.
    public function vpaaReview(Request $request, FacultyAchievement $achievement)
    {
        $user = $request->user();
        abort_unless($achievement->status === 'dean_approved', 403, 'Only Dean-approved submissions can be reviewed by VPAA.');

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $deanId = $achievement->approved_by; // whoever approved it at the Dean stage

        $achievement->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'rejected_by' => $request->status === 'rejected' ? $user->id : null,
            'vpaa_approved_by' => $request->status === 'approved' ? $user->id : null,
            'vpaa_approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        $submittedDate = $achievement->created_at->format('M j, Y');

        if ($request->status === 'approved') {
            $this->notify(
                $deanId,
                'Achievement submission approved by VPAA',
                "The Achievement submission from {$submittedDate} that you approved was approved by VPAA {$user->name} and is now visible to the President.",
                ['category' => 'achievements', 'record_id' => $achievement->id]
            );
        } else {
            $this->notify(
                $deanId,
                'Achievement submission needs revision',
                "VPAA {$user->name} sent back the Achievement submission from {$submittedDate} — the Department Head's data needs revision: {$request->rejection_reason}",
                ['category' => 'achievements', 'record_id' => $achievement->id]
            );
            $this->notify(
                $achievement->submitted_by,
                'Your submission needs revision',
                "VPAA sent back your Achievement submission from {$submittedDate} for revision: {$request->rejection_reason}",
                ['category' => 'achievements', 'record_id' => $achievement->id]
            );
        }

        return response()->json($achievement);
    }

    public function destroy(FacultyAchievement $achievement)
    {
        $achievement->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
