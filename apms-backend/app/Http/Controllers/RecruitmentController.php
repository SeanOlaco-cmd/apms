<?php

namespace App\Http\Controllers;

use App\Models\RecruitmentData;
use Illuminate\Http\Request;

class RecruitmentController extends Controller
{
    public function index()
    {
        return RecruitmentData::with(['school', 'academicPeriod'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'applicants' => 'required|integer',
            'accepted' => 'required|integer',
            'enrolled' => 'required|integer',
            'walk_in' => 'required|integer',
            'online' => 'required|integer',
            'referrals' => 'required|integer',
        ]);

        $data = RecruitmentData::create($request->all());
        return response()->json($data, 201);
    }

    public function show(RecruitmentData $recruitment)
    {
        return $recruitment->load(['school', 'academicPeriod']);
    }

    public function update(Request $request, RecruitmentData $recruitment)
    {
        $recruitment->update($request->all());
        return response()->json($recruitment);
    }

    public function destroy(RecruitmentData $recruitment)
    {
        $recruitment->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}