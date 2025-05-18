<?php

namespace App\Http\Controllers;

use App\Services\InventoryAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class AnalyticsController extends Controller
{
    /**
     * The inventory analytics service instance.
     */
    protected $analyticsService;

    /**
     * Create a new controller instance.
     */
    public function __construct(InventoryAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
        // Temporarily comment out middleware for testing
        // $this->middleware('auth:sanctum');
        // $this->middleware('permission:view_reports')->except('getDashboardData');
    }

    /**
     * Get complete analytics dashboard data
     * 
     * @return JsonResponse
     */
    public function getDashboardData(): JsonResponse
    {
        try {
            // Get all the analytics data
            $forecasts = $this->analyticsService->generateDemandForecasts();
            $anomalies = $this->analyticsService->detectAnomalies();
            $procurement = $this->analyticsService->generateProcurementRecommendations();
            $movement = $this->analyticsService->classifyItemMovement();

            // Create summary data
            $summary = [
                'totalForecastedDemand' => array_sum(array_column($forecasts['items'], 'total_forecast_demand')),
                'forecastTrend' => $this->analyticsService->calculateForecastTrend(),
                'itemsToReorder' => count($procurement['items']),
                'urgentItems' => count(array_filter($procurement['items'], function($item) {
                    return $item['urgency'] === 'high';
                })),
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
            Log::error('Error in analytics dashboard: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to load analytics data',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while processing your request'
            ], 500);
        }
    }

    /**
     * Get demand forecasts for all items
     * 
     * @return JsonResponse
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
            Log::error('Error generating forecasts: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate forecasts',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while processing your request'
            ], 500);
        }
    }

    /**
     * Get anomaly detection results
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function anomalies(Request $request): JsonResponse
    {
        try {
            // Validate threshold parameter if provided
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
            Log::error('Error detecting anomalies: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to detect anomalies',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while processing your request'
            ], 500);
        }
    }

    /**
     * Get procurement recommendations
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function procurement(Request $request): JsonResponse
    {
        try {
            // Validate minStockDays parameter if provided
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
            Log::error('Error generating procurement recommendations: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate procurement recommendations',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while processing your request'
            ], 500);
        }
    }

    /**
     * Get item movement classification
     * 
     * @return JsonResponse
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
            Log::error('Error classifying item movement: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to classify item movement',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while processing your request'
            ], 500);
        }
    }
}
