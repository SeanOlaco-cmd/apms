<?php

namespace App\Http\Controllers;

use App\Models\School;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    public function index()
    {
        return School::where('is_active', true)->get();
    }

    public function store(Request $request)
    {
        $data = School::create($request->all());
        return response()->json($data, 201);
    }

    public function show(School $school)
    {
        return $school;
    }

    public function update(Request $request, School $school)
    {
        $school->update($request->all());
        return response()->json($school);
    }

    public function destroy(School $school)
    {
        $school->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}