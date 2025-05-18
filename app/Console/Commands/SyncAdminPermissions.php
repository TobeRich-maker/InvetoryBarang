<?php

namespace App\Console\Commands;

use App\Models\Role;
use Illuminate\Console\Command;

class SyncAdminPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:sync-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync all permissions to the admin role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $adminRole = Role::where('name', 'admin')->first();
        
        if (!$adminRole) {
            $this->error('Admin role not found!');
            return 1;
        }
        
        $result = $adminRole->syncAllPermissions();
        
        if ($result) {
            $this->info('All permissions have been synced to the admin role successfully.');
            $this->info('Total permissions: ' . $adminRole->permissions()->count());
            return 0;
        } else {
            $this->error('Failed to sync permissions to the admin role.');
            return 1;
        }
    }
}
