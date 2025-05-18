<?php

namespace App\Services;

use App\Models\LogBarang;
use App\Models\Barang;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryAnalyticsService
{
    /**
     * Get historical transaction data for analysis
     * 
     * @param int $days Number of days of historical data to retrieve
     * @return array
     */
    public function getHistoricalData($days = 180)
    {
        $startDate = Carbon::now()->subDays($days);
        
        $transactions = LogBarang::with(['barang', 'barang.kategori'])
            ->where('tanggal', '>=', $startDate)
            ->orderBy('tanggal')
            ->get();
            
        // Transform data for analysis
        $transformedData = [];
        
        foreach ($transactions as $transaction) {
            $itemId = $transaction->barang_id;
            $date = Carbon::parse($transaction->tanggal)->format('Y-m-d');
            
            if (!isset($transformedData[$itemId])) {
                $transformedData[$itemId] = [
                    'item_id' => $itemId,
                    'item_name' => $transaction->barang->nama_barang,
                    'category' => $transaction->barang->kategori->kategori ?? 'Uncategorized',
                    'daily_data' => [],
                ];
            }
            
            if (!isset($transformedData[$itemId]['daily_data'][$date])) {
                $transformedData[$itemId]['daily_data'][$date] = [
                    'date' => $date,
                    'quantity_in' => 0,
                    'quantity_out' => 0,
                ];
            }
            
            // Update quantities based on transaction type
            if ($transaction->tipe === 'masuk') {
                $transformedData[$itemId]['daily_data'][$date]['quantity_in'] += $transaction->jumlah;
            } else {
                $transformedData[$itemId]['daily_data'][$date]['quantity_out'] += $transaction->jumlah;
            }
        }
        
        // Fill in missing dates and convert to sequential arrays
        foreach ($transformedData as &$item) {
            $period = CarbonPeriod::create($startDate, Carbon::now());
            $sequentialData = [];
            
            foreach ($period as $date) {
                $dateStr = $date->format('Y-m-d');
                if (isset($item['daily_data'][$dateStr])) {
                    $sequentialData[] = $item['daily_data'][$dateStr];
                } else {
                    $sequentialData[] = [
                        'date' => $dateStr,
                        'quantity_in' => 0,
                        'quantity_out' => 0,
                    ];
                }
            }
            
            $item['daily_data'] = $sequentialData;
        }
        
        return array_values($transformedData);
    }
    
    /**
     * Generate demand forecasts using exponential smoothing
     * 
     * @param int $forecastDays Number of days to forecast
     * @return array
     */
    public function generateDemandForecasts($forecastDays = 30)
    {
        $historicalData = $this->getHistoricalData();
        $forecasts = [];
        
        foreach ($historicalData as $itemData) {
            $itemId = $itemData['item_id'];
            $itemName = $itemData['item_name'];
            $category = $itemData['category'];
            
            // Extract quantity_out values for forecasting
            $timeSeriesData = array_column($itemData['daily_data'], 'quantity_out');
            
            // Simple exponential smoothing with alpha = 0.3
            $alpha = 0.3;
            $smoothed = $this->exponentialSmoothing($timeSeriesData, $alpha);
            
            // Generate forecast for next 30 days
            $lastSmoothedValue = end($smoothed);
            $forecast = array_fill(0, $forecastDays, $lastSmoothedValue);
            
            // Calculate average daily demand and standard deviation
            $avgDailyDemand = array_sum($timeSeriesData) / count($timeSeriesData);
            $stdDev = $this->standardDeviation($timeSeriesData);
            
            // Get current stock level
            $currentStock = Barang::find($itemId)->stok ?? 0;
            
            // Calculate days of inventory remaining
            $daysRemaining = $avgDailyDemand > 0 ? round($currentStock / $avgDailyDemand) : 999;
            
            // Prepare forecast data
            $forecastDates = [];
            $startDate = Carbon::tomorrow();
            
            for ($i = 0; $i < $forecastDays; $i++) {
                $forecastDate = $startDate->copy()->addDays($i)->format('Y-m-d');
                $forecastDates[] = [
                    'date' => $forecastDate,
                    'forecast' => round($forecast[$i], 2)
                ];
            }
            
            $forecasts[] = [
                'item_id' => $itemId,
                'item_name' => $itemName,
                'category' => $category,
                'current_stock' => $currentStock,
                'avg_daily_demand' => round($avgDailyDemand, 2),
                'std_deviation' => round($stdDev, 2),
                'days_remaining' => $daysRemaining,
                'historical_data' => $itemData['daily_data'],
                'forecast_data' => $forecastDates,
                'total_forecast_demand' => round(array_sum($forecast), 2)
            ];
        }
        
        return $forecasts;
    }
    
    /**
     * Detect anomalies in transaction data using Z-score method
     * 
     * @param float $threshold Z-score threshold for anomaly detection
     * @return array
     */
    public function detectAnomalies($threshold = 2.5)
    {
        $historicalData = $this->getHistoricalData(90); // Last 90 days
        $anomalies = [];
        
        foreach ($historicalData as $itemData) {
            $itemId = $itemData['item_id'];
            $itemName = $itemData['item_name'];
            $category = $itemData['category'];
            
            // Extract quantity_out values
            $outValues = array_column($itemData['daily_data'], 'quantity_out');
            
            // Calculate mean and standard deviation
            $mean = array_sum($outValues) / count($outValues);
            $stdDev = $this->standardDeviation($outValues);
            
            // Skip items with no variation
            if ($stdDev == 0) continue;
            
            // Calculate Z-scores and find anomalies
            $itemAnomalies = [];
            
            foreach ($itemData['daily_data'] as $index => $day) {
                $zScore = ($day['quantity_out'] - $mean) / $stdDev;
                
                if (abs($zScore) > $threshold && $day['quantity_out'] > 0) {
                    $itemAnomalies[] = [
                        'date' => $day['date'],
                        'quantity' => $day['quantity_out'],
                        'z_score' => round($zScore, 2),
                        'type' => $zScore > 0 ? 'high_demand' : 'low_demand'
                    ];
                }
            }
            
            if (count($itemAnomalies) > 0) {
                $anomalies[] = [
                    'item_id' => $itemId,
                    'item_name' => $itemName,
                    'category' => $category,
                    'mean_demand' => round($mean, 2),
                    'std_deviation' => round($stdDev, 2),
                    'anomalies' => $itemAnomalies
                ];
            }
        }
        
        return $anomalies;
    }
    
    /**
     * Generate procurement recommendations based on forecasts
     * 
     * @param int $minStockDays Minimum days of stock to maintain
     * @return array
     */
    public function generateProcurementRecommendations($minStockDays = 14)
    {
        $forecasts = $this->generateDemandForecasts();
        $recommendations = [];
        
        foreach ($forecasts as $itemForecast) {
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
            if ($a['urgency'] === $b['urgency']) {
                return $b['days_remaining'] <=> $a['days_remaining'];
            }
            return $a['urgency'] <=> $b['urgency'];
        });
        
        return $recommendations;
    }
    
    /**
     * Classify items based on movement patterns
     * 
     * @return array
     */
    public function classifyItemMovement()
    {
        $historicalData = $this->getHistoricalData(90); // Last 90 days
        $classifications = [];
        
        foreach ($historicalData as $itemData) {
            $itemId = $itemData['item_id'];
            $itemName = $itemData['item_name'];
            $category = $itemData['category'];
            
            // Calculate metrics for classification
            $outValues = array_column($itemData['daily_data'], 'quantity_out');
            $totalDemand = array_sum($outValues);
            $daysWithMovement = count(array_filter($outValues));
            $movementFrequency = $daysWithMovement / count($outValues);
            
            // Get current stock
            $currentStock = Barang::find($itemId)->stok ?? 0;
            
            // Classify based on movement frequency and total demand
            $movementClass = $this->getMovementClass($movementFrequency, $totalDemand);
            
            $classifications[] = [
                'item_id' => $itemId,
                'item_name' => $itemName,
                'category' => $category,
                'current_stock' => $currentStock,
                'total_demand_90_days' => $totalDemand,
                'days_with_movement' => $daysWithMovement,
                'movement_frequency' => round($movementFrequency, 2),
                'movement_class' => $movementClass,
                'metrics' => [
                    'frequency_score' => round($movementFrequency * 100, 2),
                    'volume_score' => $this->calculateVolumeScore($totalDemand)
                ]
            ];
        }
        
        // Group by movement class
        $groupedByClass = [];
        foreach ($classifications as $item) {
            $class = $item['movement_class'];
            if (!isset($groupedByClass[$class])) {
                $groupedByClass[$class] = [];
            }
            $groupedByClass[$class][] = $item;
        }
        
        // Calculate summary statistics for each class
        $summary = [];
        foreach ($groupedByClass as $class => $items) {
            $totalItems = count($items);
            $totalStock = array_sum(array_column($items, 'current_stock'));
            $totalDemand = array_sum(array_column($items, 'total_demand_90_days'));
            
            $summary[$class] = [
                'count' => $totalItems,
                'percentage' => round(($totalItems / count($classifications)) * 100, 2),
                'total_stock' => $totalStock,
                'total_demand_90_days' => $totalDemand,
                'stock_percentage' => 0, // Will calculate after all classes are processed
            ];
        }
        
        // Calculate stock percentage
        $totalStockAll = array_sum(array_column($summary, 'total_stock'));
        foreach ($summary as $class => &$stats) {
            $stats['stock_percentage'] = $totalStockAll > 0 
                ? round(($stats['total_stock'] / $totalStockAll) * 100, 2) 
                : 0;
        }
        
        return [
            'items' => $classifications,
            'summary' => $summary
        ];
    }
    
    /**
     * Helper method for exponential smoothing
     */
    private function exponentialSmoothing($data, $alpha)
    {
        $smoothed = [$data[0]]; // Initialize with first value
        
        for ($i = 1; $i < count($data); $i++) {
            $smoothed[] = $alpha * $data[$i] + (1 - $alpha) * $smoothed[$i - 1];
        }
        
        return $smoothed;
    }
    
    /**
     * Calculate standard deviation
     */
    private function standardDeviation($data)
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
     * Calculate urgency level for procurement
     */
    private function calculateUrgency($daysRemaining, $minStockDays)
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
     * Determine movement class based on frequency and volume
     */
    private function getMovementClass($frequency, $totalDemand)
    {
        // Calculate volume score (normalized based on your inventory)
        $volumeScore = $this->calculateVolumeScore($totalDemand);
        
        // Classification logic
        if ($frequency < 0.1) {
            return 'dead_stock';
        } elseif ($frequency < 0.3) {
            return $volumeScore > 50 ? 'slow_moving' : 'dead_stock';
        } elseif ($frequency < 0.5) {
            return $volumeScore > 70 ? 'medium_moving' : 'slow_moving';
        } else {
            return $volumeScore > 50 ? 'fast_moving' : 'medium_moving';
        }
    }
    
    /**
     * Calculate volume score (0-100) based on total demand
     * This should be calibrated based on your specific inventory
     */
    private function calculateVolumeScore($totalDemand)
    {
        // Get the highest demand item for normalization
        $maxDemand = DB::table('log_barang')
            ->where('tipe', 'keluar')
            ->where('tanggal', '>=', Carbon::now()->subDays(90))
            ->sum('jumlah');
            
        if ($maxDemand == 0) return 0;
        
        // Normalize to 0-100 scale with logarithmic scaling for better distribution
        $score = min(100, max(0, 100 * log(1 + $totalDemand) / log(1 + $maxDemand)));
        
        return round($score, 2);
    }
}
