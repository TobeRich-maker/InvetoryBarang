<?php

namespace App\Services;

use App\Models\Barang;
use App\Models\LogBarang;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

class InventoryAnalyticsService
{
    /**
     * Get historical transaction data for analysis
     * 
     * @param int $days Number of days of historical data to retrieve
     * @return Collection
     */
    public function getHistoricalData(int $days = 90): Collection
    {
        try {
            $startDate = Carbon::now()->subDays($days);
            
            // Optimize query to fetch only necessary data - removed kategori_id which doesn't exist
            $transactions = LogBarang::with(['barang:id,nama_barang,stok,kategori'])
                ->where('tanggal', '>=', $startDate)
                ->select('id', 'barang_id', 'tanggal', 'jumlah', 'tipe')
                ->orderBy('tanggal')
                ->get();
                
            // Transform data for analysis
            $transformedData = collect();
            
            // Group transactions by item
            $groupedTransactions = $transactions->groupBy('barang_id');
            
            foreach ($groupedTransactions as $itemId => $itemTransactions) {
                $item = $itemTransactions->first()->barang;
                
                if (!$item) continue;
                
                // Create date range for complete timeline
                $dateRange = collect();
                $period = new \DatePeriod(
                    $startDate,
                    new \DateInterval('P1D'),
                    Carbon::now()
                );
                
                foreach ($period as $date) {
                    $dateStr = $date->format('Y-m-d');
                    $dateRange->put($dateStr, [
                        'date' => $dateStr,
                        'quantity_in' => 0,
                        'quantity_out' => 0,
                    ]);
                }
                
                // Fill in actual transaction data
                foreach ($itemTransactions as $transaction) {
                    $dateStr = Carbon::parse($transaction->tanggal)->format('Y-m-d');
                    
                    if (!$dateRange->has($dateStr)) continue;
                    
                    $dateData = $dateRange->get($dateStr);
                    
                    if ($transaction->tipe === 'masuk') {
                        $dateData['quantity_in'] += $transaction->jumlah;
                    } else {
                        $dateData['quantity_out'] += $transaction->jumlah;
                    }
                    
                    $dateRange->put($dateStr, $dateData);
                }
                
                $transformedData->push([
                    'item_id' => $itemId,
                    'item_name' => $item->nama_barang,
                    'category' => $item->kategori ?? 'Uncategorized',
                    'current_stock' => $item->stok,
                    'daily_data' => $dateRange->values(),
                ]);
            }
            
            return $transformedData;
        } catch (Exception $e) {
            Log::error('Error getting historical data: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Generate demand forecasts using exponential smoothing
     * 
     * @param int $forecastDays Number of days to forecast
     * @return array
     */
    public function generateDemandForecasts(int $forecastDays = 30): array
    {
        try {
            // Use caching to improve performance
            $cacheKey = 'demand_forecasts_' . $forecastDays;
            
            return Cache::remember($cacheKey, now()->addHours(6), function () use ($forecastDays) {
                $historicalData = $this->getHistoricalData();
                $forecasts = [];
                
                foreach ($historicalData as $itemData) {
                    // Extract quantity_out values for forecasting
                    $timeSeriesData = $itemData['daily_data']->pluck('quantity_out')->toArray();
                    
                    // Calculate statistics
                    $avgDailyDemand = count($timeSeriesData) > 0 ? array_sum($timeSeriesData) / count($timeSeriesData) : 0;
                    $stdDev = $this->calculateStandardDeviation($timeSeriesData);
                    
                    // Generate forecast using exponential smoothing
                    $forecast = $this->generateForecast($timeSeriesData, $forecastDays);
                    
                    // Calculate days of inventory remaining
                    $daysRemaining = $avgDailyDemand > 0 ? $itemData['current_stock'] / $avgDailyDemand : 999;
                    
                    // Prepare forecast dates
                    $forecastDates = $this->prepareForecastDates($forecast, $forecastDays);
                    
                    $forecasts[] = [
                        'item_id' => $itemData['item_id'],
                        'item_name' => $itemData['item_name'],
                        'category' => $itemData['category'],
                        'current_stock' => $itemData['current_stock'],
                        'avg_daily_demand' => round($avgDailyDemand, 2),
                        'std_deviation' => round($stdDev, 2),
                        'days_remaining' => round($daysRemaining),
                        'historical_data' => $itemData['daily_data'],
                        'forecast_data' => $forecastDates,
                        'total_forecast_demand' => round(array_sum($forecast), 2)
                    ];
                }
                
                return ['items' => $forecasts];
            });
        } catch (Exception $e) {
            Log::error('Error generating demand forecasts: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Detect anomalies in transaction data using Z-score method
     * 
     * @param float $threshold Z-score threshold for anomaly detection
     * @return array
     */
    public function detectAnomalies(float $threshold = 2.5): array
    {
        try {
            $historicalData = $this->getHistoricalData(90); // Last 90 days
            $anomalies = [];
            $surgeCount = 0;
            $dropCount = 0;
            
            foreach ($historicalData as $itemData) {
                // Extract quantity_out values
                $outValues = $itemData['daily_data']->pluck('quantity_out')->toArray();
                
                // Calculate mean and standard deviation
                $mean = array_sum($outValues) / count($outValues);
                $stdDev = $this->calculateStandardDeviation($outValues);
                
                // Skip items with no variation
                if ($stdDev == 0) continue;
                
                // Calculate Z-scores and find anomalies
                $itemAnomalies = $this->findAnomalies($itemData, $outValues, $mean, $stdDev, $threshold);
                
                if (count($itemAnomalies['anomalies']) > 0) {
                    $anomalies[] = [
                        'item_id' => $itemData['item_id'],
                        'item_name' => $itemData['item_name'],
                        'category' => $itemData['category'],
                        'mean_demand' => round($mean, 2),
                        'std_deviation' => round($stdDev, 2),
                        'anomalies' => $itemAnomalies['anomalies']
                    ];
                    
                    $surgeCount += $itemAnomalies['surgeCount'];
                    $dropCount += $itemAnomalies['dropCount'];
                }
            }
            
            return [
                'anomalies' => $anomalies,
                'summary' => [
                    'totalAnomalies' => count($anomalies),
                    'surgeAnomalies' => $surgeCount,
                    'dropAnomalies' => $dropCount
                ]
            ];
        } catch (Exception $e) {
            Log::error('Error detecting anomalies: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Generate procurement recommendations based on forecasts
     * 
     * @param int $minStockDays Minimum days of stock to maintain
     * @return array
     */
    public function generateProcurementRecommendations(int $minStockDays = 14): array
    {
        try {
            $forecasts = $this->generateDemandForecasts();
            $recommendations = [];
            
            foreach ($forecasts['items'] as $itemForecast) {
                $currentStock = $itemForecast['current_stock'];
                $avgDailyDemand = $itemForecast['avg_daily_demand'];
                $totalForecastDemand = $itemForecast['total_forecast_demand'];
                
                // Skip items with no demand
                if ($avgDailyDemand == 0) continue;
                
                // Calculate safety stock (2 weeks of average demand)
                $safetyStock = $avgDailyDemand * $minStockDays;
                
                // Calculate recommended purchase quantity
                $recommendedPurchase = max(0, $totalForecastDemand + $safetyStock - $currentStock);
                
                // Only include items that need reordering
                if ($recommendedPurchase > 0) {
                    $recommendations[] = [
                        'item_id' => $itemForecast['item_id'],
                        'item_name' => $itemForecast['item_name'],
                        'category' => $itemForecast['category'],
                        'current_stock' => $currentStock,
                        'avg_daily_demand' => $avgDailyDemand,
                        'forecast_30_days' => $totalForecastDemand,
                        'safety_stock' => round($safetyStock, 2),
                        'recommended_purchase' => ceil($recommendedPurchase),
                        'days_remaining' => $itemForecast['days_remaining'],
                        'urgency' => $this->calculateUrgency($itemForecast['days_remaining'], $minStockDays)
                    ];
                }
            }
            
            // Sort by urgency (high to low)
            usort($recommendations, function($a, $b) {
                $urgencyOrder = ['high' => 0, 'medium' => 1, 'low' => 2];
                if ($urgencyOrder[$a['urgency']] !== $urgencyOrder[$b['urgency']]) {
                    return $urgencyOrder[$a['urgency']] - $urgencyOrder[$b['urgency']];
                }
                return $a['days_remaining'] - $b['days_remaining'];
            });
            
            return [
                'items' => $recommendations
            ];
        } catch (Exception $e) {
            Log::error('Error generating procurement recommendations: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Classify items based on movement patterns
     * 
     * @return array
     */
    public function classifyItemMovement(): array
    {
        try {
            // Use caching to improve performance
            return Cache::remember('item_movement_classification', now()->addHours(12), function () {
                // Updated to match your actual schema - removed kategori_id
                $items = Barang::select('id', 'nama_barang', 'stok', 'kategori')->get();
                $classifiedItems = [];
                $fastMovingCount = 0;
                $mediumMovingCount = 0;
                $slowMovingCount = 0;
                $deadStockCount = 0;
                
                foreach ($items as $item) {
                    // Get transaction metrics for the past 90 days
                    $metrics = $this->getItemTransactionMetrics($item->id);
                    
                    // Classify based on movement frequency and total demand
                    $classification = $this->classifyItemByMovement($metrics['frequency'], $metrics['volume']);
                    
                    // Update counters
                    switch ($classification) {
                        case 'Fast Moving':
                            $fastMovingCount++;
                            break;
                        case 'Medium Moving':
                            $mediumMovingCount++;
                            break;
                        case 'Slow Moving':
                            $slowMovingCount++;
                            break;
                        default:
                            $deadStockCount++;
                    }
                    
                    $classifiedItems[] = [
                        'id' => $item->id,
                        'name' => $item->nama_barang,
                        'category' => $item->kategori ?? 'Uncategorized',
                        'current_stock' => $item->stok,
                        'transaction_frequency' => $metrics['frequency'],
                        'transaction_volume' => $metrics['volume'],
                        'days_since_last_transaction' => $metrics['daysSinceLastTransaction'],
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
            });
        } catch (Exception $e) {
            Log::error('Error classifying item movement: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Calculate forecast trend percentage
     * 
     * @return int
     */
    public function calculateForecastTrend(): int
    {
        try {
            // Compare last 30 days with previous 30 days
            $last30Days = LogBarang::where('tipe', 'keluar')
                ->where('tanggal', '>=', Carbon::now()->subDays(30))
                ->sum('jumlah');
                
            $previous30Days = LogBarang::where('tipe', 'keluar')
                ->whereBetween('tanggal', [
                    Carbon::now()->subDays(60),
                    Carbon::now()->subDays(30)
                ])
                ->sum('jumlah');
    
            if ($previous30Days == 0) {
                return 0;
            }
    
            return round((($last30Days - $previous30Days) / $previous30Days) * 100);
        } catch (Exception $e) {
            Log::error('Error calculating forecast trend: ' . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Calculate standard deviation
     * 
     * @param array $data
     * @return float
     */
    private function calculateStandardDeviation(array $data): float
    {
        $n = count($data);
        if ($n === 0) return 0;
        
        $mean = array_sum($data) / $n;
        $variance = 0;
        
        foreach ($data as $value) {
            $variance += pow($value - $mean, 2);
        }
        
        return sqrt($variance / $n);
    }
    
    /**
     * Generate forecast using exponential smoothing
     * 
     * @param array $data Historical data
     * @param int $forecastDays Days to forecast
     * @param float $alpha Smoothing factor
     * @return array
     */
    private function generateForecast(array $data, int $forecastDays, float $alpha = 0.3): array
    {
        if (empty($data)) {
            return array_fill(0, $forecastDays, 0);
        }
        
        // Initialize with first value or average if more appropriate
        $smoothed = [count($data) > 0 ? array_sum($data) / count($data) : 0];
        
        // Apply exponential smoothing to historical data
        for ($i = 1; $i < count($data); $i++) {
            $smoothed[] = $alpha * $data[$i] + (1 - $alpha) * $smoothed[$i - 1];
        }
        
        // Generate forecast for future days
        $lastSmoothedValue = end($smoothed);
        $forecast = array_fill(0, $forecastDays, $lastSmoothedValue);
        
        return $forecast;
    }
    
    /**
     * Prepare forecast dates array
     * 
     * @param array $forecast
     * @param int $forecastDays
     * @return array
     */
    private function prepareForecastDates(array $forecast, int $forecastDays): array
    {
        $forecastDates = [];
        $startDate = Carbon::tomorrow();
        
        for ($i = 0; $i < $forecastDays; $i++) {
            $forecastDate = $startDate->copy()->addDays($i)->format('Y-m-d');
            $forecastDates[] = [
                'date' => $forecastDate,
                'forecast' => round($forecast[$i], 2)
            ];
        }
        
        return $forecastDates;
    }
    
    /**
     * Find anomalies in item transaction data
     * 
     * @param array $itemData
     * @param array $outValues
     * @param float $mean
     * @param float $stdDev
     * @param float $threshold
     * @return array
     */
    private function findAnomalies(array $itemData, array $outValues, float $mean, float $stdDev, float $threshold): array
    {
        $anomalies = [];
        $surgeCount = 0;
        $dropCount = 0;
        
        foreach ($itemData['daily_data'] as $index => $day) {
            if (!isset($outValues[$index])) continue;
            
            $zScore = ($outValues[$index] - $mean) / $stdDev;
            
            if (abs($zScore) > $threshold && $outValues[$index] > 0) {
                $type = $zScore > 0 ? 'surge' : 'drop';
                
                if ($type === 'surge') {
                    $surgeCount++;
                    $description = "Unusual high demand of {$outValues[$index]} units (normally around " . round($mean, 1) . " units)";
                } else {
                    $dropCount++;
                    $description = "Unusually low demand of {$outValues[$index]} units (normally around " . round($mean, 1) . " units)";
                }
                
                $anomalies[] = [
                    'date' => $day['date'],
                    'quantity' => $outValues[$index],
                    'z_score' => round($zScore, 2),
                    'type' => $type,
                    'description' => $description
                ];
            }
        }
        
        return [
            'anomalies' => $anomalies,
            'surgeCount' => $surgeCount,
            'dropCount' => $dropCount
        ];
    }
    
    /**
     * Calculate urgency level for procurement
     * 
     * @param int $daysRemaining
     * @param int $minStockDays
     * @return string
     */
    private function calculateUrgency(int $daysRemaining, int $minStockDays): string
    {
        if ($daysRemaining <= 7) {
            return 'high';
        } elseif ($daysRemaining <= $minStockDays) {
            return 'medium';
        } else {
            return 'low';
        }
    }
    
    /**
     * Get transaction metrics for an item
     * 
     * @param int $itemId
     * @return array
     */
    private function getItemTransactionMetrics(int $itemId): array
    {
        $startDate = Carbon::now()->subDays(90);
        
        // Get transaction dates and volumes
        $transactions = LogBarang::where('barang_id', $itemId)
            ->where('tipe', 'keluar')
            ->where('tanggal', '>=', $startDate)
            ->select('tanggal', 'jumlah')
            ->get();
        
        // Calculate unique transaction dates
        $uniqueDates = $transactions->pluck('tanggal')
            ->map(function ($date) {
                return Carbon::parse($date)->format('Y-m-d');
            })
            ->unique()
            ->count();
        
        // Calculate total volume
        $totalVolume = $transactions->sum('jumlah');
        
        // Calculate days since last transaction
        $lastTransaction = $transactions->sortByDesc('tanggal')->first();
        $daysSinceLastTransaction = $lastTransaction 
            ? Carbon::parse($lastTransaction->tanggal)->diffInDays(Carbon::now()) 
            : 90;
        
        return [
            'frequency' => $uniqueDates,
            'volume' => $totalVolume,
            'daysSinceLastTransaction' => $daysSinceLastTransaction
        ];
    }
    
    /**
     * Classify item based on movement patterns
     * 
     * @param int $frequency
     * @param int $volume
     * @return string
     */
    private function classifyItemByMovement(int $frequency, int $volume): string
    {
        if ($frequency >= 15 && $volume >= 100) {
            return 'Fast Moving';
        } elseif ($frequency >= 5 && $volume >= 30) {
            return 'Medium Moving';
        } elseif ($frequency > 0 || $volume > 0) {
            return 'Slow Moving';
        } else {
            return 'Dead Stock';
        }
    }
}
