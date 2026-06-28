<?php

namespace App\Http\Controllers;

use App\Models\CorporatePartnership;
use Illuminate\Http\Request;

class PartnershipController extends Controller
{
    public function index()
    {
        return CorporatePartnership::with(['school'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'company_name' => 'required|string',
            'partnership_type' => 'required|in:internship,research,scholarship,employment,training,other',
            'status' => 'required|in:active,expired,pending',
        ]);

        $data = CorporatePartnership::create($request->all());
        return response()->json($data, 201);
    }

    public function show(CorporatePartnership $partnership)
    {
        return $partnership->load(['school']);
    }

    public function update(Request $request, CorporatePartnership $partnership)
    {
        $partnership->update($request->all());
        return response()->json($partnership);
    }

    public function destroy(CorporatePartnership $partnership)
    {
        $partnership->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}