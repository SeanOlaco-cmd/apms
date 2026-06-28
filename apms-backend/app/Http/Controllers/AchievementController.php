<?php

namespace App\Http\Controllers;

use App\Models\FacultyAchievement;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index()
    {
        return FacultyAchievement::with(['school', 'academicPeriod'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'faculty_name' => 'required|string',
            'achievement_title' => 'required|string',
            'type' => 'required|in:research,publication,award,certification,training,other',
        ]);

        $data = FacultyAchievement::create($request->all());
        return response()->json($data, 201);
    }

    public function show(FacultyAchievement $achievement)
    {
        return $achievement->load(['school', 'academicPeriod']);
    }

    public function update(Request $request, FacultyAchievement $achievement)
    {
        $achievement->update($request->all());
        return response()->json($achievement);
    }

    public function destroy(FacultyAchievement $achievement)
    {
        $achievement->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}