<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        // When a role is saved, ensure admin role has all permissions
        static::saved(function ($role) {
            if ($role->name === 'admin') {
                $role->syncAllPermissions();
            }
        });
        
        // When a new permission is created, ensure admin role gets it
        static::created(function ($role) {
            if ($role->name === 'admin') {
                $role->syncAllPermissions();
            }
        });
    }

    /**
     * Get the users for the role.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * The permissions that belong to the role.
     */
public function permissions()
{
    return $this->belongsToMany(Permission::class, 'role_permission', 'role_id', 'permission_id');
}


    /**
     * Check if the role has a specific permission.
     */
    public function hasPermission($permission)
    {
        // Use cached permissions to improve performance
        $permissions = Cache::remember('role_' . $this->id . '_permissions', 60 * 60, function () {
            return $this->permissions->pluck('name')->toArray();
        });
        
        if (is_string($permission)) {
            return in_array($permission, $permissions);
        }
        
        if ($permission instanceof Permission) {
            return in_array($permission->name, $permissions);
        }
        
        return false;
    }

    /**
     * Sync all available permissions to this role.
     * Particularly useful for the admin role.
     */
    public function syncAllPermissions()
    {
        try {
            $allPermissions = Permission::pluck('id')->toArray();
            $this->permissions()->sync($allPermissions);
            
            // Clear the permissions cache
            Cache::forget('role_' . $this->id . '_permissions');
            
            Log::info('All permissions synced to role', [
                'role_id' => $this->id,
                'role_name' => $this->name,
                'permission_count' => count($allPermissions)
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to sync all permissions to role', [
                'role_id' => $this->id,
                'role_name' => $this->name,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Assign permissions to the role.
     */
    public function assignPermissions($permissions)
    {
        if (is_string($permissions)) {
            $permissions = Permission::whereName($permissions)->get();
        }
        
        if ($permissions instanceof Permission) {
            $permissions = collect([$permissions]);
        }
        
        $this->permissions()->syncWithoutDetaching($permissions);
        
        // Clear the permissions cache
        Cache::forget('role_' . $this->id . '_permissions');
        
        return $this;
    }

    /**
     * Remove permissions from the role.
     */
    public function removePermissions($permissions)
    {
        if (is_string($permissions)) {
            $permissions = Permission::whereName($permissions)->get();
        }
        
        if ($permissions instanceof Permission) {
            $permissions = collect([$permissions]);
        }
        
        $this->permissions()->detach($permissions);
        
        // Clear the permissions cache
        Cache::forget('role_' . $this->id . '_permissions');
        
        return $this;
    }
    
    /**
     * Sync permissions for the role.
     */
    public function syncPermissions($permissions)
    {
        if (is_string($permissions)) {
            $permissions = Permission::whereName($permissions)->get();
        }
        
        if ($permissions instanceof Permission) {
            $permissions = collect([$permissions]);
        }
        
        $this->permissions()->sync($permissions);
        
        // Clear the permissions cache
        Cache::forget('role_' . $this->id . '_permissions');
        
        return $this;
    }
}
