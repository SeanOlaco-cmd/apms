<?php

namespace App\Http\Controllers;

use App\Models\AccreditationStatus;
use Illuminate\Http\Request;

class AccreditationController extends Controller
{
    public function index()
    {
        return AccreditationStatus::with(['school', 'program'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'program_id' => 'required|exists:programs,id',
            'accrediting_body' => 'required|string',
            'level' => 'required|in:Level I,Level II,Level III,Level IV,Candidate,Not Accredited',
            'status' => 'required|in:active,expired,pending,suspended',
        ]);

        $data = AccreditationStatus::create($request->all());
        return response()->json($data, 201);
    }

    public function show(AccreditationStatus $accreditation)
    {
        return $accreditation->load(['school', 'program']);
    }

    public function update(Request $request, AccreditationStatus $accreditation)
    {
        $accreditation->update($request->all());
        return response()->json($accreditation);
    }

    public function destroy(AccreditationStatus $accreditation)
    {
        $accreditation->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}