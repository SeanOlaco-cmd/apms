<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $query = Program::where('is_active', true);
        
        if ($request->has('school_id')) {
            $query->where('school_id', $request->school_id);
        }
        
        return $query->get();
    }

    public function store(Request $request)
    {
        $data = Program::create($request->all());
        return response()->json($data, 201);
    }

    public function show(Program $program)
    {
        return $program;
    }

    public function update(Request $request, Program $program)
    {
        $program->update($request->all());
        return response()->json($program);
    }

    public function destroy(Program $program)
    {
        $program->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}