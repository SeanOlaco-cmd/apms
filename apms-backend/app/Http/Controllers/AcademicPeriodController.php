<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use Illuminate\Http\Request;

class AcademicPeriodController extends Controller
{
    public function index()
    {
        return AcademicPeriod::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_year' => 'required|string',
            'semester' => 'required|in:1st,2nd,Summer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $period = AcademicPeriod::create($request->all());
        return response()->json($period, 201);
    }

    public function show(AcademicPeriod $academicPeriod)
    {
        return $academicPeriod;
    }

    public function update(Request $request, AcademicPeriod $academicPeriod)
    {
        $academicPeriod->update($request->all());
        return response()->json($academicPeriod);
    }

    public function destroy(AcademicPeriod $academicPeriod)
    {
        $academicPeriod->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}