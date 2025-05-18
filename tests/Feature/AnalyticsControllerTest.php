<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsControllerTest extends TestCase
{
    use RefreshDatabase;
    
    protected $user;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $adminRole = Role::create(['name' => 'admin']);
        $viewReportsPermission = Permission::create(['name' => 'view_reports']);
        
        $adminRole->permissions()->attach($viewReportsPermission);
        
        // Create a user with admin role
        $this->user = User::factory()->create();
        $this->user->roles()->attach($adminRole);
    }
    
    /** @test */
    public function unauthenticated_users_cannot_access_analytics()
    {
        $response = $this->getJson('/api/analytics/dashboard');
        
        $response->assertStatus(401);
    }
    
    /** @test */
    public function authenticated_users_can_access_analytics_dashboard()
    {
        Sanctum::actingAs($this->user);
        
        $response = $this->getJson('/api/analytics/dashboard');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary',
                    'forecasts',
                    'anomalies',
                    'procurement',
                    'movement'
                ]
            ]);
    }
    
    /** @test */
    public function users_can_access_specific_analytics_endpoints()
    {
        Sanctum::actingAs($this->user);
        
        // Test forecasts endpoint
        $response = $this->getJson('/api/analytics/forecasts');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data'
            ]);
        
        // Test anomalies endpoint
        $response = $this->getJson('/api/analytics/anomalies');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data'
            ]);
        
        // Test procurement endpoint
        $response = $this->getJson('/api/analytics/procurement');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data'
            ]);
        
        // Test movement endpoint
        $response = $this->getJson('/api/analytics/movement');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data'
            ]);
    }
    
    /** @test */
    public function analytics_endpoints_validate_parameters()
    {
        Sanctum::actingAs($this->user);
        
        // Test invalid threshold parameter
        $response = $this->getJson('/api/analytics/anomalies?threshold=-1');
        $response->assertStatus(422);
        
        // Test invalid min_stock_days parameter
        $response = $this->getJson('/api/analytics/procurement?min_stock_days=0');
        $response->assertStatus(422);
    }
}
