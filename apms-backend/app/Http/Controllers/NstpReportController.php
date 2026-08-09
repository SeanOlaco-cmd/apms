<?php

namespace App\Http\Controllers;

use App\Models\NstpReport;
use Illuminate\Http\Request;

class NstpReportController extends Controller
{
    public function index()
    {
        return NstpReport::with(['submittedBy'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'barangay_name' => 'required|string',
            'activity_title' => 'required|string',
            'participants' => 'required|integer',
            'student_volunteers' => 'required|integer',
            'hours_rendered' => 'required|numeric',
        ]);

        $data = NstpReport::create([
            ...$request->all(),
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);
        return response()->json($data, 201);
    }

    public function show(NstpReport $nstpReport)
    {
        return $nstpReport->load(['submittedBy']);
    }

    public function update(Request $request, NstpReport $nstpReport)
    {
        $nstpReport->update($request->all());
        return response()->json($nstpReport);
    }

    public function destroy(NstpReport $nstpReport)
    {
        $nstpReport->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}