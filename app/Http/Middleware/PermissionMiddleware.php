<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        if (!$request->user()) {
            Log::warning('Unauthenticated access attempt', [
                'path' => $request->path(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            
            return response()->json([
                'message' => 'Unauthenticated.',
                'details' => 'You must be logged in to access this resource.',
            ], 401);
        }

        // Load the role relationship if it hasn't been loaded yet
        if (!$request->user()->relationLoaded('role')) {
            $request->user()->load('role');
        }

        // Admin role always has access to everything
        if ($request->user()->role && $request->user()->role->name === 'admin') {
            return $next($request);
        }

        // For non-admin roles, check specific permissions
        if (!$request->user()->relationLoaded('role.permissions')) {
            $request->user()->load('role.permissions');
        }

        $userPermissions = $request->user()->role->permissions->pluck('name')->toArray();
        
        // Check if user has any of the required permissions
        foreach ($permissions as $permission) {
            if (in_array($permission, $userPermissions)) {
                return $next($request);
            }
        }

        Log::warning('Unauthorized access attempt - missing permission', [
            'user_id' => $request->user()->id,
            'user_role' => $request->user()->role->name ?? 'unknown',
            'user_permissions' => $userPermissions,
            'required_permissions' => $permissions,
            'path' => $request->path(),
        ]);

        return response()->json([
            'message' => 'Unauthorized.',
            'details' => 'You do not have the required permissions to access this resource.',
            'required_permissions' => $permissions,
        ], 403);
    }
}
