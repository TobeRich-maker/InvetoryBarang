<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Permission extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'group',
    ];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        // When a new permission is created, assign it to the admin role
        static::created(function ($permission) {
            try {
                $adminRole = Role::where('name', 'admin')->first();
                
                if ($adminRole) {
                    $adminRole->permissions()->syncWithoutDetaching([$permission->id]);
                    
                    Log::info('New permission automatically assigned to admin role', [
                        'permission_id' => $permission->id,
                        'permission_name' => $permission->name,
                        'admin_role_id' => $adminRole->id
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to assign new permission to admin role', [
                    'permission_id' => $permission->id,
                    'permission_name' => $permission->name,
                    'error' => $e->getMessage()
                ]);
            }
        });
    }

    /**
     * The roles that belong to the permission.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}
