<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login.
     */
    public function login(Request $request)
    {
        try {
            Log::info('Login attempt', [
                'email' => $request->email,
                'has_csrf' => $request->hasHeader('X-CSRF-TOKEN'),
                'session_id' => session()->getId(),
                'session_token' => csrf_token(),
                'headers' => $request->headers->all(),
            ]);

            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                Log::warning('Failed login attempt', [
                    'email' => $request->email,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
                
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            // Load the role relationship
            // $user->load('role');
            $user->load('role.permissions');

            

            // Revoke all previous tokens
            $user->tokens()->delete();

            // Create token with longer expiration (30 days)
            $token = $user->createToken('api-token', ['*'], now()->addDays(30))->plainTextToken;

            Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role->name,
                'token_preview' => substr($token, 0, 10) . '...',
            ]);

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            Log::error('Exception during login', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            
            Log::info('User logged out', [
                'user_id' => $request->user()->id,
            ]);

            return response()->json(['message' => 'Logged out successfully']);
        } catch (\Exception $e) {
            Log::error('Exception during logout', [
                'message' => $e->getMessage(),
            ]);
            
            throw $e;
        }
    }

    /**
     * Get the authenticated user with role and permissions.
     */
    public function user(Request $request)
    {
        try {
            Log::info('User data request', [
                'user_id' => $request->user() ? $request->user()->id : 'not authenticated',
                'headers' => collect($request->headers->all())
                    ->map(function ($header) {
                        return is_array($header) && count($header) === 1 ? $header[0] : $header;
                    })
                    ->toArray(),
                'token' => $request->bearerToken() ? substr($request->bearerToken(), 0, 10) . '...' : 'no token',
            ]);
            
            // Make sure user is authenticated
            if (!$request->user()) {
                Log::warning('User endpoint accessed without authentication');
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            
            // Load role with permissions
            $user = $request->user();
            
            // Check if role relationship exists
            if (!$user->role) {
                Log::error('User has no role assigned', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
                
                return response()->json([
                    'message' => 'User has no role assigned',
                    'user_id' => $user->id,
                ], 500);
            }
            
            // Load permissions
            try {
                $user->load('role.permissions');
            } catch (\Exception $e) {
                Log::error('Failed to load role permissions', [
                    'user_id' => $user->id,
                    'role_id' => $user->role->id,
                    'error' => $e->getMessage(),
                ]);
                
                // Continue without permissions if there's an error
            }
            
            // Prepare permissions array safely
            $permissions = [];
            if ($user->role && $user->role->permissions) {
                $permissions = $user->role->permissions->pluck('name')->toArray();
            }
            
            Log::info('User data fetched', [
                'user_id' => $user->id,
                'role' => $user->role->name ?? 'unknown',
                'permissions_count' => count($permissions),
            ]);
            
            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'permissions' => $permissions,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Exception while fetching user data', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'message' => 'An error occurred while fetching user data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Refresh the user's token.
     */
    public function refreshToken(Request $request)
    {
        try {
            // Revoke the current token
            $request->user()->currentAccessToken()->delete();
            
            // Create a new token
            $token = $request->user()->createToken('api-token', ['*'], now()->addDays(30))->plainTextToken;
            
            Log::info('Token refreshed', [
                'user_id' => $request->user()->id,
                'token_preview' => substr($token, 0, 10) . '...',
            ]);

            return response()->json([
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            Log::error('Exception during token refresh', [
                'message' => $e->getMessage(),
            ]);
            
            throw $e;
        }
    }
}
