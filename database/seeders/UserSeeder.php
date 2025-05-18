<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get role IDs
        $adminRole = Role::where('name', 'admin')->first();
        $staffRole = Role::where('name', 'staff')->first();
        $viewerRole = Role::where('name', 'viewer')->first();

        // Create admin user if it doesn't exist
        User::firstOrCreate(
            ['email' => 'admin@example.com'], 
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
            ]
        );

        // Create staff user if it doesn't exist
        User::firstOrCreate(
            ['email' => 'staff@example.com'], 
            [
                'name' => 'Staff User',
                'password' => Hash::make('password'),
                'role_id' => $staffRole->id,
            ]
        );

        // Create viewer user if it doesn't exist
        User::firstOrCreate(
            ['email' => 'viewer@example.com'], 
            [
                'name' => 'Viewer User',
                'password' => Hash::make('password'),
                'role_id' => $viewerRole->id,
            ]
        );
    }
}
