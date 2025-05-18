<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all roles
        $adminRole = Role::where('name', 'admin')->first();
        $staffRole = Role::where('name', 'staff')->first();
        $viewerRole = Role::where('name', 'viewer')->first();
        
        if (!$adminRole || !$staffRole || !$viewerRole) {
            $this->command->info('Roles not found. Please run RoleSeeder first.');
            return;
        }
        
        // Get all permissions
        $permissions = Permission::all();
        
        // Assign all permissions to admin
        $adminRole->permissions()->sync($permissions->pluck('id')->toArray());
        
        // Assign specific permissions to staff
        $staffPermissions = Permission::whereIn('name', [
            'view_users',
            'view_roles',
            'view_items',
            'manage_items',
            'view_transactions',
            'manage_transactions',
            'view_categories',
            'view_reports',
            'export_data'
        ])->get();
        
        $staffRole->permissions()->sync($staffPermissions->pluck('id')->toArray());
        
        // Assign limited permissions to viewer
        $viewerPermissions = Permission::whereIn('name', [
            'view_items',
            'view_transactions',
            'view_categories',
            'view_reports'
        ])->get();
        
        $viewerRole->permissions()->sync($viewerPermissions->pluck('id')->toArray());
    }
}
