<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class AuthController extends Controller
{
    // Accepts either the email OR the username in one field — most people
    // typing from memory want the short one, not the full @cct.edu.ph address.
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->login)
            ->orWhere('username', $request->login)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account is inactive. Please contact the administrator.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'school_id' => $user->school_id,
                'program_id' => $user->program_id,
                'avatar_path' => $user->avatar_path,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    // "Log out of all devices" — revokes every token, not just this session's.
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out of all devices'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // 7-12 characters, letters/numbers plus common symbols. Not enforced
    // at login — only here and on account creation — since some already-
    // seeded accounts are longer than 12 and would otherwise be locked out.
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => [
                'required',
                'confirmed',
                'regex:/^[A-Za-z0-9_@$!%*#?&.\-]{7,12}$/',
            ],
        ], [
            'new_password.regex' => 'Password must be 7-12 characters, using letters, numbers, and common symbols like _ @ $ ! % * # ? & . -',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    // Users pick their own short login name (the System Admin doesn't have
    // to type 20+ of them). 2-7 characters, letters/numbers/underscore.
    public function updateUsername(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'username' => [
                'required',
                'string',
                'regex:/^[A-Za-z0-9_]{2,7}$/',
                'unique:users,username,' . $user->id,
            ],
        ], [
            'username.regex' => 'Username must be 2-7 characters: letters, numbers, and underscores only.',
            'username.unique' => 'That username is already taken.',
        ]);

        $user->update(['username' => $request->username]);

        return response()->json(['username' => $user->username]);
    }

    // Any logged-in user can set/replace their own picture — no admin step.
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048', // 2MB cap
        ]);

        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_path' => $path]);

        return response()->json([
            'avatar_path' => $path,
            'avatar_url' => Storage::disk('public')->url($path),
        ]);
    }

    public function removeAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
            $user->update(['avatar_path' => null]);
        }

        return response()->json(['message' => 'Avatar removed']);
    }
}
