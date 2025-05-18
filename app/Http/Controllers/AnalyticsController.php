<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Barang;
use App\Models\LogBarang;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get complete analytics dashboard data
     */
    public function getDashboardData()
    {
        // // Check permission
        // if (!auth()->user()->can('view_reports')) {
        //     return response()->json(['message' => 'Unauthorized'], 403);
        // }

        // Get all the analytics data
        $forecasts = $this->getDemandForecasts();
        $anomalies = $this->getAnomalies();
        $procurement = $this->getProcurementRecommendations();
        $movement = $this->getMovementClassification();

        // Create summary data
        $summary = [
            'totalForecastedDemand' => array_sum(array_map(function($item) {
                return $item['totalForecastedDemand'];
            }, $forecasts['items'])),
            'forecastTrend' => $this->calculateForecastTrend(),
            'itemsToReorder' => count(array_filter($procurement['items'], function($item) {
                return $item['recommendedPurchase'] > 0;
            })),
            'urgentItems' => count(array_filter($procurement['items'], function($item) {
                return $item['urgency'] === 'high';
            })),
            'anomalyCount' => count($anomalies['anomalies']),
            'anomalyPeriod' => 30,
            'fastMovingCount' => $movement['summary']['fastMovingCount'],
            'fastMovingPercentage' => round(($movement['summary']['fastMovingCount'] / count($movement['items'])) * 100)
        ];

        return response()->json([
            'summary' => $summary,
            'forecasts' => $forecasts,
            'anomalies' => $anomalies,
            'procurement' => $procurement,
            'movement' => $movement
        ]);
    }

    /**
     * Get demand forecasts for all items
     */
    public function forecasts()
    {
        // Check permission
        if (!auth()->user()->can('view_reports')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($this->getDemandForecasts());
    }

    /**
     * Get anomaly detection results
     */
    public function anomalies()
    {
        // Check permission
        if (!auth()->user()->can('view_reports')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($this->getAnomalies());
    }

    /**
     * Get procurement recommendations
     */
    public function procurement()
    {
        // Check permission
        if (!auth()->user()->can('view_reports')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($this->getProcurementRecommendations());
    }

    /**
     * Get item movement classification
     */
    public function movement()
    {
        // Check permission
        if (!auth()->user()->can('view_reports')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($this->getMovementClassification());
    }

    /**
     * Calculate demand forecasts using exponential smoothing
     */
    private function getDemandForecasts()
    {
        $items = Barang::all();
        $forecastItems = [];
        $today = Carbon::today();

        foreach ($items as $item) {
            // Get historical data - daily aggregated outgoing quantities for the past 90 days
            $historicalData = LogBarang::where('barang_id', $item->id)
                ->where('tipe', 'out')
                ->where('created_at', '>=', Carbon::now()->subDays(90))
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(jumlah) as jumlah')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->keyBy('date')
                ->toArray();

            // Fill in missing dates with zero jumlah
            $filledData = [];
            for ($i = 90; $i >= 1; $i--) {
                $date = Carbon::now()->subDays($i)->format('Y-m-d');
                $filledData[$date] = [
                    'date' => $date,
                    'jumlah' => isset($historicalData[$date]) ? $historicalData[$date]['jumlah'] : 0
                ];
            }

            // Calculate average daily demand and standard deviation
            $quantities = array_column($filledData, 'jumlah');
            $avgDailyDemand = count($quantities) > 0 ? array_sum($quantities) / count($quantities) : 0;
            $stdDevDemand = $this->standardDeviation($quantities);

            // Simple exponential smoothing for forecasting
            $alpha = 0.3; // Smoothing factor
            $forecast = $avgDailyDemand;
            $forecastData = [];

            // Add historical data to chart
            foreach ($filledData as $date => $data) {
                $forecastData[] = [
                    'date' => $date,
                    'actual' => $data['jumlah'],
                    'forecast' => null
                ];
                
                // Update forecast for next day
                $forecast = $alpha * $data['jumlah'] + (1 - $alpha) * $forecast;
            }

            // Generate forecasts for next 30 days
            $totalForecastedDemand = 0;
            for ($i = 1; $i <= 30; $i++) {
                $date = Carbon::now()->addDays($i)->format('Y-m-d');
                $forecastData[] = [
                    'date' => $date,
                    'actual' => null,
                    'forecast' => round($forecast, 2)
                ];
                $totalForecastedDemand += $forecast;
            }

            // Calculate days of inventory remaining
            $daysRemaining = $avgDailyDemand > 0 ? $item->stock / $avgDailyDemand : 999;

            $forecastItems[] = [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'currentStock' => $item->stock,
                'avgDailyDemand' => $avgDailyDemand,
                'stdDevDemand' => $stdDevDemand,
                'daysRemaining' => $daysRemaining,
                'totalForecastedDemand' => round($totalForecastedDemand),
                'forecastData' => $forecastData
            ];
        }

        return [
            'items' => $forecastItems
        ];
    }

    /**
     * Detect anomalies in transaction data using Z-score
     */
    private function getAnomalies()
    {
        $anomalies = [];
        $items = Barang::all();
        $surgeCount = 0;
        $dropCount = 0;

        foreach ($items as $item) {
            // Get daily transaction data for the past 90 days
            $transactions = LogBarang::where('barang_id', $item->id)
                ->where('created_at', '>=', Carbon::now()->subDays(90))
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(CASE WHEN tipe = "out" THEN jumlah ELSE 0 END) as out_qty'),
                    DB::raw('SUM(CASE WHEN tipe = "in" THEN jumlah ELSE 0 END) as in_qty')
                )
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get();

            if ($transactions->count() < 5) {
                continue; // Not enough data for anomaly detection
            }

            // Calculate mean and standard deviation for outgoing quantities
            $outQuantities = $transactions->pluck('out_qty')->toArray();
            $mean = array_sum($outQuantities) / count($outQuantities);
            $stdDev = $this->standardDeviation($outQuantities);

            // Skip if standard deviation is too low (not enough variation)
            if ($stdDev < 0.1) {
                continue;
            }

            // Check each transaction for anomalies
            foreach ($transactions as $transaction) {
                $zScore = $stdDev > 0 ? ($transaction->out_qty - $mean) / $stdDev : 0;

                // Consider it an anomaly if Z-score is beyond threshold
                if (abs($zScore) >= 2) {
                    $tipe = $zScore > 0 ? 'surge' : 'drop';
                    
                    if ($tipe === 'surge') {
                        $surgeCount++;
                        $description = "Unusual high demand of {$transaction->out_qty} units (normally around " . round($mean, 1) . " units)";
                    } else {
                        $dropCount++;
                        $description = "Unusually low demand of {$transaction->out_qty} units (normally around " . round($mean, 1) . " units)";
                    }

                    $anomalies[] = [
                        'id' => count($anomalies) + 1,
                        'itemId' => $item->id,
                        'itemName' => $item->name,
                        'date' => $transaction->date,
                        'jumlah' => $transaction->out_qty,
                        'expected' => round($mean, 1),
                        'zScore' => round($zScore, 2),
                        'tipe' => $tipe,
                        'description' => $description
                    ];
                }
            }
        }

        // Sort anomalies by date (most recent first)
        usort($anomalies, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return [
            'anomalies' => $anomalies,
            'summary' => [
                'totalAnomalies' => count($anomalies),
                'surgeAnomalies' => $surgeCount,
                'dropAnomalies' => $dropCount
            ]
        ];
    }

    /**
     * Generate procurement recommendations
     */
    private function getProcurementRecommendations()
    {
        $items = Barang::all();
        $procurementItems = [];

        foreach ($items as $item) {
            // Get average daily demand from the past 30 days
            $avgDailyDemand = LogBarang::where('barang_id', $item->id)
                ->where('tipe', 'out')
                ->where('created_at', '>=', Carbon::now()->subDays(30))
                ->sum('jumlah') / 30;

            // Calculate safety stock (2 weeks worth of inventory)
            $safetyStock = ceil($avgDailyDemand * 14);
            
            // Calculate forecasted need for next 30 days
            $forecastedNeed = ceil($avgDailyDemand * 30);
            
            // Calculate recommended purchase jumlah
            $recommendedPurchase = max(0, $forecastedNeed + $safetyStock - $item->stock);
            
            // Determine urgency level
            $daysOfInventory = $avgDailyDemand > 0 ? $item->stock / $avgDailyDemand : 999;
            $urgency = 'low';
            
            if ($daysOfInventory <= 7) {
                $urgency = 'high';
            } elseif ($daysOfInventory <= 14) {
                $urgency = 'medium';
            }

            $procurementItems[] = [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'currentStock' => $item->stock,
                'forecastedNeed' => $forecastedNeed,
                'safetyStock' => $safetyStock,
                'recommendedPurchase' => $recommendedPurchase,
                'urgency' => $urgency,
                'daysOfInventory' => round($daysOfInventory, 1)
            ];
        }

        // Sort by urgency (high to low) and then by days of inventory (low to high)
        usort($procurementItems, function($a, $b) {
            $urgencyOrder = ['high' => 0, 'medium' => 1, 'low' => 2];
            if ($urgencyOrder[$a['urgency']] !== $urgencyOrder[$b['urgency']]) {
                return $urgencyOrder[$a['urgency']] - $urgencyOrder[$b['urgency']];
            }
            return $a['daysOfInventory'] - $b['daysOfInventory'];
        });

        return [
            'items' => $procurementItems
        ];
    }

    /**
     * Classify items based on movement patterns
     */
    private function getMovementClassification()
    {
        $items = Barang::all();
        $classifiedItems = [];
        $fastMovingCount = 0;
        $mediumMovingCount = 0;
        $slowMovingCount = 0;
        $deadStockCount = 0;

        foreach ($items as $item) {
            // Get transaction data for the past 90 days
            $transactions = LogBarang::where('barang_id', $item->id)
                ->where('created_at', '>=', Carbon::now()->subDays(90))
                ->get();

            // Calculate metrics
            $transactionDates = $transactions->where('tipe', 'out')->pluck('created_at')->toArray();
            $uniqueDates = count(array_unique(array_map(function($date) {
                return Carbon::parse($date)->format('Y-m-d');
            }, $transactionDates)));

            $transactionFrequency = $uniqueDates; // Number of days with transactions
            $transactionVolume = $transactions->where('tipe', 'out')->sum('jumlah'); // Total jumlah moved
            
            // Calculate days since last transaction
            $lastTransaction = $transactions->where('tipe', 'out')->sortByDesc('created_at')->first();
            $daysSinceLastTransaction = $lastTransaction 
                ? Carbon::parse($lastTransaction->created_at)->diffInDays(Carbon::now()) 
                : 90;

            // Classify the item
            $classification = 'Dead Stock'; // Default
            
            if ($transactionFrequency >= 15 && $transactionVolume >= 100) {
                $classification = 'Fast Moving';
                $fastMovingCount++;
            } elseif ($transactionFrequency >= 5 && $transactionVolume >= 30) {
                $classification = 'Medium Moving';
                $mediumMovingCount++;
            } elseif ($transactionFrequency > 0 || $transactionVolume > 0) {
                $classification = 'Slow Moving';
                $slowMovingCount++;
            } else {
                $deadStockCount++;
            }

            $classifiedItems[] = [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'transactionFrequency' => $transactionFrequency,
                'transactionVolume' => $transactionVolume,
                'daysSinceLastTransaction' => $daysSinceLastTransaction,
                'classification' => $classification
            ];
        }

        return [
            'items' => $classifiedItems,
            'summary' => [
                'fastMovingCount' => $fastMovingCount,
                'mediumMovingCount' => $mediumMovingCount,
                'slowMovingCount' => $slowMovingCount,
                'deadStockCount' => $deadStockCount
            ]
        ];
    }

    /**
     * Calculate the standard deviation of an array of values
     */
    private function standardDeviation(array $values)
    {
        $count = count($values);
        if ($count === 0) {
            return 0;
        }

        $mean = array_sum($values) / $count;
        $variance = 0;

        foreach ($values as $value) {
            $variance += pow($value - $mean, 2);
        }

        return sqrt($variance / $count);
    }

    /**
     * Calculate the trend percentage in forecasted demand
     */
    private function calculateForecastTrend()
    {
        // Compare last 30 days with previous 30 days
        $last30Days = LogBarang::where('tipe', 'out')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->sum('jumlah');
            
        $previous30Days = LogBarang::where('tipe', 'out')
            ->whereBetween('created_at', [
                Carbon::now()->subDays(60),
                Carbon::now()->subDays(30)
            ])
            ->sum('jumlah');

        if ($previous30Days == 0) {
            return 0;
        }

        return round((($last30Days - $previous30Days) / $previous30Days) * 100);
    }
}
