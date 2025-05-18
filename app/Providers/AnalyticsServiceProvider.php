<?php

namespace App\Providers;

use App\Services\InventoryAnalyticsService;
use Illuminate\Support\ServiceProvider;

class AnalyticsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(InventoryAnalyticsService::class, function ($app) {
            return new InventoryAnalyticsService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
