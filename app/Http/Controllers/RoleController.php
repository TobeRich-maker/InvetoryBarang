<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Role::with('permissions')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles',
        ]);

        $role = Role::create($validated);
        
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }
        
        $role->load('permissions');

        return response()->json($role, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        $role->load('permissions');
        return response()->json($role);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($role->id),
            ],
        ]);

        $role->update($validated);
        
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }
        
        $role->load('permissions');

        return response()->json($role);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // Prevent deleting roles that have users
        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete role with associated users.',
                'user_count' => $role->users()->count()
            ], 422);
        }
        
        $role->delete();

        return response()->json(null, 204);
    }
    
    /**
     * Assign permissions to a role.
     */
    public function assignPermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);
        
        $role->syncPermissions($validated['permissions']);
        $role->load('permissions');
        
        return response()->json($role);
    }
}
