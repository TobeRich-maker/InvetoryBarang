<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class AuthService
{
    /**
     * Check if a user has a specific role.
     *
     * @param User $user
     * @param string|array $roles
     * @return bool
     */
    public function hasRole(User $user, $roles): bool
    {
        if (is_string($roles)) {
            return $user->hasRole($roles);
        }

        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a user has a specific permission.
     *
     * @param User $user
     * @param string|array $permissions
     * @return bool
     */
    public function hasPermission(User $user, $permissions): bool
    {
        if (is_string($permissions)) {
            return $user->hasPermission($permissions);
        }

        foreach ($permissions as $permission) {
            if ($user->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all permissions for a user.
     *
     * @param User $user
     * @return array
     */
    public function getUserPermissions(User $user): array
    {
        // Cache permissions for 60 minutes to improve performance
        return Cache::remember('user_permissions_' . $user->id, 60 * 60, function () use ($user) {
            if (!$user->role) {
                return [];
            }

            return $user->role->permissions->pluck('name')->toArray();
        });
    }

    /**
     * Clear the permissions cache for a user.
     *
     * @param User $user
     * @return void
     */
    public function clearPermissionsCache(User $user): void
    {
        Cache::forget('user_permissions_' . $user->id);
    }
}
