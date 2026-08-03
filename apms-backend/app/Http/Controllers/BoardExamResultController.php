<?php

namespace App\Http\Controllers;

use App\Models\BoardExamResult;
use Illuminate\Http\Request;

class BoardExamResultController extends Controller
{
    public function index()
    {
        return BoardExamResult::with(['school', 'program', 'academicPeriod'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'program_id' => 'required|exists:programs,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'total_examinees' => 'required|integer',
            'total_passers' => 'required|integer',
            'passing_rate' => 'required|numeric',
            'first_timers' => 'required|integer',
            'first_timer_passers' => 'required|integer',
            'first_timer_passing_rate' => 'required|numeric',
        ]);

        $data = BoardExamResult::create([
            ...$request->all(),
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);
        return response()->json($data, 201);
    }

    public function show(BoardExamResult $boardExamResult)
    {
        return $boardExamResult->load(['school', 'program', 'academicPeriod']);
    }

    public function update(Request $request, BoardExamResult $boardExamResult)
    {
        $boardExamResult->update($request->all());
        return response()->json($boardExamResult);
    }

    public function destroy(BoardExamResult $boardExamResult)
    {
        $boardExamResult->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}