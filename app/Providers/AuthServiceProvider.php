<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Laravel\Sanctum\Sanctum;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Override the Sanctum token finding method to support our fixed tokens
        Sanctum::authenticateAccessTokensUsing(function ($token, $isValid) {
            // If the standard validation passes, return true
            if ($isValid) {
                return true;
            }
            
            // Otherwise, try to find a user with a matching token pattern
            $tokenParts = explode('_', $token);
            if (count($tokenParts) !== 2) {
                return false;
            }
            
            $prefix = $tokenParts[0];
            $series = (int) $tokenParts[1];
            
            // Find user with matching token prefix
            $user = User::where('token_prefix', $prefix)->first();
            if (!$user) {
                return false;
            }
            
            // Check if the series is valid (equal to or less than current series)
            return $series <= $user->token_series;
        });
    }
}
