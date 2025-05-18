<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Role hierarchy - defines which roles can access resources of other roles
     */
    protected $roleHierarchy = [
        'admin' => ['staff', 'viewer'],
        'staff' => ['viewer'],
        'viewer' => [],
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
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
            $request->user()->load('role.permissions');
        }

        $userRole = $request->user()->role->name ?? 'unknown';
        
        // Check if user has any of the required roles directly
        if (in_array($userRole, $roles)) {
            return $next($request);
        }
        
        // Check if user's role exists in our hierarchy
        if (!isset($this->roleHierarchy[$userRole])) {
            Log::warning('Unknown role', [
                'user_id' => $request->user()->id,
                'user_role' => $userRole,
            ]);
            
            return response()->json([
                'message' => 'Unauthorized.',
                'details' => 'Your role is not recognized in the system.',
                'your_role' => $userRole,
            ], 403);
        }
        
        // Get all roles the user has access to based on hierarchy
        $userAccessibleRoles = $this->roleHierarchy[$userRole];
        
        // Check if any of the required roles are in the user's accessible roles
        foreach ($roles as $role) {
            if (in_array($role, $userAccessibleRoles)) {
                return $next($request);
            }
        }

        Log::warning('Unauthorized access attempt', [
            'user_id' => $request->user()->id,
            'user_role' => $userRole,
            'user_accessible_roles' => $userAccessibleRoles,
            'required_roles' => $roles,
            'path' => $request->path(),
        ]);

        return response()->json([
            'message' => 'Unauthorized.',
            'details' => 'You do not have the required permissions to access this resource.',
            'your_role' => $userRole,
            'required_roles' => $roles,
        ], 403);
    }
}
