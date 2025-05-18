<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // User Management
        Permission::firstOrCreate([
            'name' => 'view_users',
        ], [
            'display_name' => 'View Users',
            'description' => 'Can view user list and details',
            'group' => 'User Management'
        ]);
        
        Permission::firstOrCreate([
            'name' => 'manage_users',
        ], [
            'display_name' => 'Manage Users',
            'description' => 'Can create, edit, and delete users',
            'group' => 'User Management'
        ]);
        
        // Role Management
        Permission::firstOrCreate([
            'name' => 'view_roles',
        ], [
            'display_name' => 'View Roles',
            'description' => 'Can view role list and details',
            'group' => 'Role Management'
        ]);
        
        Permission::firstOrCreate([
            'name' => 'manage_roles',
        ], [
            'display_name' => 'Manage Roles',
            'description' => 'Can create, edit, and delete roles and assign permissions',
            'group' => 'Role Management'
        ]);
        
        // Item Management
        Permission::firstOrCreate([
            'name' => 'view_items',
        ], [
            'display_name' => 'View Items',
            'description' => 'Can view item list and details',
            'group' => 'Inventory'
        ]);
        
        Permission::firstOrCreate([
            'name' => 'manage_items',
        ], [
            'display_name' => 'Manage Items',
            'description' => 'Can create, edit, and delete items',
            'group' => 'Inventory'
        ]);
        
        // Transaction Management
        Permission::firstOrCreate([
            'name' => 'view_transactions',
        ], [
            'display_name' => 'View Transactions',
            'description' => 'Can view transaction history',
            'group' => 'Transactions'
        ]);
        
        Permission::firstOrCreate([
            'name' => 'manage_transactions',
        ], [
            'display_name' => 'Manage Transactions',
            'description' => 'Can create and manage transactions',
            'group' => 'Transactions'
        ]);
        
        // Category Management
        Permission::firstOrCreate([
            'name' => 'view_categories',
        ], [
            'display_name' => 'View Categories',
            'description' => 'Can view categories',
            'group' => 'Categories'
        ]);
        
        Permission::firstOrCreate([
            'name' => 'manage_categories',
        ], [
            'display_name' => 'Manage Categories',
            'description' => 'Can create, edit, and delete categories',
            'group' => 'Categories'
        ]);
        
        // Reports
        Permission::firstOrCreate([
            'name' => 'view_reports',
        ], [
            'display_name' => 'View Reports',
            'description' => 'Can view reports and dashboards',
            'group' => 'Reports'
        ]);
        
        Permission::firstOrCreate([
            'name' => 'export_data',
        ], [
            'display_name' => 'Export Data',
            'description' => 'Can export data to Excel/PDF',
            'group' => 'Reports'
        ]);
        
        // System Administration
        Permission::firstOrCreate([
            'name' => 'manage_system',
        ], [
            'display_name' => 'Manage System',
            'description' => 'Can manage system settings and perform administrative tasks',
            'group' => 'System Administration'
        ]);
    }
}
