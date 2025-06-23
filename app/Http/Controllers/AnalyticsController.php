<?php

namespace App\Http\Controllers;

use App\Services\InventoryAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class AnalyticsController extends Controller
{
    /**
     * The inventory analytics service instance.
     */
    protected InventoryAnalyticsService $analyticsService;

    /**
     * Create a new controller instance.
     */
    public function __construct(InventoryAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;

        if (!config('app.debug')) {
            $this->middleware('auth:sanctum');
            $this->middleware('permission:view_reports')->except('getDashboardData');
        }
    }

    /**
     * Get complete analytics dashboard data
     */
    public function getDashboardData(): JsonResponse
    {
        try {
            // Optionally cache results
            $forecasts = $this->analyticsService->generateDemandForecasts();
            $anomalies = $this->analyticsService->detectAnomalies();
            $procurement = $this->analyticsService->generateProcurementRecommendations();
            $movement = $this->analyticsService->classifyItemMovement();

            $items = $procurement['items'];
            $urgentItems = array_filter($items, fn($item) => $item['urgency'] === 'high');

            $summary = [
                'totalForecastedDemand' => array_sum(array_column($forecasts['items'], 'total_forecast_demand')),
                'forecastTrend' => $this->analyticsService->calculateForecastTrend(),
                'itemsToReorder' => count($items),
                'urgentItems' => count($urgentItems),
                'anomalyCount' => count($anomalies['anomalies']),
                'anomalyPeriod' => 30,
                'fastMovingCount' => $movement['summary']['fastMovingCount'],
                'fastMovingPercentage' => count($movement['items']) > 0
                    ? round(($movement['summary']['fastMovingCount'] / count($movement['items'])) * 100)
                    : 0
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'forecasts' => $forecasts,
                    'anomalies' => $anomalies,
                    'procurement' => $procurement,
                    'movement' => $movement
                ]
            ]);
        } catch (Exception $e) {
            return $this->handleException($e, 'dashboard', 'Failed to load analytics data');
        }
    }

    /**
     * Get demand forecasts for all items
     */
    public function forecasts(): JsonResponse
    {
        try {
            $forecasts = $this->analyticsService->generateDemandForecasts();

            return response()->json([
                'success' => true,
                'data' => $forecasts
            ]);
        } catch (Exception $e) {
            return $this->handleException($e, 'forecasts', 'Failed to generate forecasts');
        }
    }

    /**
     * Get anomaly detection results
     */
    public function anomalies(Request $request): JsonResponse
    {
        try {
            $threshold = $request->input('threshold', 2.5);

            if (!is_numeric($threshold) || $threshold <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid threshold parameter. Must be a positive number.'
                ], 422);
            }

            $anomalies = $this->analyticsService->detectAnomalies((float) $threshold);

            return response()->json([
                'success' => true,
                'data' => $anomalies
            ]);
        } catch (Exception $e) {
            return $this->handleException($e, 'anomalies', 'Failed to detect anomalies');
        }
    }

    /**
     * Get procurement recommendations
     */
    public function procurement(Request $request): JsonResponse
    {
        try {
            $minStockDays = $request->input('min_stock_days', 14);

            if (!is_numeric($minStockDays) || $minStockDays <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid min_stock_days parameter. Must be a positive number.'
                ], 422);
            }

            $procurement = $this->analyticsService->generateProcurementRecommendations((int) $minStockDays);

            return response()->json([
                'success' => true,
                'data' => $procurement
            ]);
        } catch (Exception $e) {
            return $this->handleException($e, 'procurement', 'Failed to generate procurement recommendations');
        }
    }

    /**
     * Get item movement classification
     */
    public function movement(): JsonResponse
    {
        try {
            $movement = $this->analyticsService->classifyItemMovement();

            return response()->json([
                'success' => true,
                'data' => $movement
            ]);
        } catch (Exception $e) {
            return $this->handleException($e, 'movement', 'Failed to classify item movement');
        }
    }

    /**
     * Handle exceptions and logging
     */
    private function handleException(Exception $e, string $context, string $userMessage): JsonResponse
    {
        Log::error("Error in $context: {$e->getMessage()}", [
            'context' => $context,
            'user_id' => auth()->id() ?? 'guest',
            'trace' => config('app.debug') ? $e->getTraceAsString() : null
        ]);

        return response()->json([
            'success' => false,
            'message' => $userMessage,
            'error' => config('app.debug') ? $e->getMessage() : $userMessage
        ], 500);
    }
}
