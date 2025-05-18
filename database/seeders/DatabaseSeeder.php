<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the migration to add token fields if they don't exist
        try {
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2023_05_10_000000_add_token_series_to_users_table.php',
                '--force' => true,
            ]);
        } catch (\Exception $e) {
            // Migration might already exist, continue
        }

        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            BarangSeeder::class,
            LogBarangSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class, 
        ]);
    }
}
