<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'preferred_currency' => 'nullable|string|size:3'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'preferred_currency' => $request->preferred_currency ?? 'USD',
        ]);

        $minimalUser = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'preferred_currency' => $user->preferred_currency,
            'is_guest' => false,
        ];

        return response()->json([
            'user' => $minimalUser,
            'token' => $user->createToken('auth_token')->plainTextToken
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Eager load only minimal fields
        $user = User::select('id', 'name', 'email', 'password', 'preferred_currency', 'is_guest')
            ->where('email', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $minimalUser = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'preferred_currency' => $user->preferred_currency,
            'is_guest' => (bool)$user->is_guest,
        ];

        // Store user in cache for fast retrieves
        Cache::put("user_profile_{$user->id}", $minimalUser, 300);

        return response()->json([
            'user' => $minimalUser,
            'token' => $user->createToken('auth_token')->plainTextToken
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()->delete();
            Cache::forget("user_profile_{$user->id}");
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        $cachedUser = Cache::remember("user_profile_{$user->id}", 300, function () use ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'preferred_currency' => $user->preferred_currency,
                'is_guest' => (bool)$user->is_guest,
            ];
        });
        return response()->json($cachedUser);
    }
}
