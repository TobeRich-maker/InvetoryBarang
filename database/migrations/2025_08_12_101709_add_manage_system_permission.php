<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;

class AddManageSystemPermission extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if the permission already exists
        $existingPermission = Permission::where('name', 'manage_system')->first();
        
        if (!$existingPermission) {
            Permission::create([
                'name' => 'manage_system',
                'display_name' => 'Manage System',
                'description' => 'Can manage system settings and perform administrative tasks',
                'group' => 'System Administration'
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Permission::where('name', 'manage_system')->delete();
    }
}
