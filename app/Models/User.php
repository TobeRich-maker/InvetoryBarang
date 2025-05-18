<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'token_prefix',
        'token_series',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'token_prefix',
        'token_series',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the role that owns the user.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole($roleName)
    {
        return $this->role && $this->role->name === $roleName;
    }
    
    /**
     * Check if user has a specific permission.
     */
    public function hasPermission($permission)
    {
        if (!$this->role) {
            return false;
        }
        
        // Admin role always has all permissions
        if ($this->role->name === 'admin') {
            return true;
        }
        
        return $this->role->hasPermission($permission);
    }

    /**
     * Get the logs for the user.
     */
    public function logs()
    {
        return $this->hasMany(LogBarang::class);
    }

    /**
     * Generate a fixed token with incrementing series.
     */
    public function generateFixedToken($name = 'api-token')
    {
        // Create a token prefix if it doesn't exist
        if (empty($this->token_prefix)) {
            $this->token_prefix = Str::random(20);
            $this->save();
        }

        // Increment the token series
        $this->token_series++;
        $this->save();

        // Revoke all previous tokens
        $this->tokens()->delete();

        // Create the token with the fixed prefix and incrementing series
        $tokenString = $this->token_prefix . '_' . $this->token_series;
        
        // Hash the token for storage in the database
        $token = $this->createToken($name, ['*'], now()->addDays(30));
        
        // Replace the token value with our custom one
        \DB::table('personal_access_tokens')
            ->where('id', $token->accessToken->id)
            ->update(['token' => hash('sha256', $tokenString)]);

        return $tokenString;
    }
}
