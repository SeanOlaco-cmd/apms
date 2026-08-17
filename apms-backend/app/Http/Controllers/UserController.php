<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return User::with(['school', 'program'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'school_id' => $request->school_id ?: null,
            'program_id' => $request->program_id ?: null,
            'is_active' => true,
        ]);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        return $user->load(['school', 'program']);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->except('password');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if (isset($data['school_id']) && $data['school_id'] === '') {
            $data['school_id'] = null;
        }

        if (isset($data['program_id']) && $data['program_id'] === '') {
            $data['program_id'] = null;
        }

        $user->update($data);
        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}