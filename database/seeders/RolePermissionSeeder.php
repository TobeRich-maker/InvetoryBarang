<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if the role_permission table exists
        if (!Schema::hasTable('role_permission')) {
            $this->command->error('The role_permission table does not exist. Please run the migration first.');
            return;
        }
        
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
        
        if ($permissions->isEmpty()) {
            $this->command->info('No permissions found. Please run PermissionSeeder first.');
            return;
        }
        
        try {
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
            
            $this->command->info('Role permissions seeded successfully.');
        } catch (\Exception $e) {
            Log::error('Error seeding role permissions: ' . $e->getMessage());
            $this->command->error('Error seeding role permissions: ' . $e->getMessage());
        }
    }
}
