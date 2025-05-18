<?php

namespace Tests\Unit\Services;

use App\Models\Barang;
use App\Models\LogBarang;
use App\Services\InventoryAnalyticsService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryAnalyticsServiceTest extends TestCase
{
    use RefreshDatabase;
    
    protected $service;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new InventoryAnalyticsService();
    }
    
    /** @test */
    public function it_can_calculate_standard_deviation()
    {
        $method = new \ReflectionMethod(InventoryAnalyticsService::class, 'calculateStandardDeviation');
        $method->setAccessible(true);
        
        // Test with known values
        $data = [2, 4, 4, 4, 5, 5, 7, 9];
        $expectedStdDev = 2.0; // Calculated manually
        
        $result = $method->invoke($this->service, $data);
        
        $this->assertEquals($expectedStdDev, round($result, 1));
    }
    
    /** @test */
    public function it_can_generate_forecasts()
    {
        // Create test data
        $kategori = \App\Models\Kategori::create(['kategori' => 'Test Category']);
        
        $barang = Barang::create([
            'nama_barang' => 'Test Item',
            'kategori_id' => $kategori->id,
            'stok' => 100,
        ]);
        
        // Create some log entries
        $startDate = Carbon::now()->subDays(30);
        
        for ($i = 0; $i < 30; $i++) {
            LogBarang::create([
                'barang_id' => $barang->id,
                'tanggal' => $startDate->copy()->addDays($i),
                'jumlah' => rand(1, 10),
                'tipe' => 'keluar',
                'keterangan' => 'Test transaction'
            ]);
        }
        
        // Get forecasts
        $forecasts = $this->service->generateDemandForecasts();
        
        // Basic assertions
        $this->assertIsArray($forecasts);
        $this->assertArrayHasKey('items', $forecasts);
        $this->assertNotEmpty($forecasts['items']);
        
        // Check forecast structure
        $firstItem = $forecasts['items'][0];
        $this->assertArrayHasKey('item_id', $firstItem);
        $this->assertArrayHasKey('forecast_data', $firstItem);
        $this->assertCount(30, $firstItem['forecast_data']);
    }
    
    /** @test */
    public function it_can_detect_anomalies()
    {
        // Create test data with anomalies
        $kategori = \App\Models\Kategori::create(['kategori' => 'Test Category']);
        
        $barang = Barang::create([
            'nama_barang' => 'Test Item',
            'kategori_id' => $kategori->id,
            'stok' => 100,
        ]);
        
        // Create normal transactions
        $startDate = Carbon::now()->subDays(30);
        
        for ($i = 0; $i < 30; $i++) {
            LogBarang::create([
                'barang_id' => $barang->id,
                'tanggal' => $startDate->copy()->addDays($i),
                'jumlah' => 5, // Consistent amount
                'tipe' => 'keluar',
                'keterangan' => 'Normal transaction'
            ]);
        }
        
        // Create one anomaly (much higher value)
        LogBarang::create([
            'barang_id' => $barang->id,
            'tanggal' => Carbon::now()->subDays(5),
            'jumlah' => 50, // 10x normal amount
            'tipe' => 'keluar',
            'keterangan' => 'Anomaly transaction'
        ]);
        
        // Get anomalies
        $anomalies = $this->service->detectAnomalies(2.0); // Lower threshold to ensure detection
        
        // Basic assertions
        $this->assertIsArray($anomalies);
        $this->assertArrayHasKey('anomalies', $anomalies);
        $this->assertNotEmpty($anomalies['anomalies']);
    }
    
    /** @test */
    public function it_can_generate_procurement_recommendations()
    {
        // Create test data
        $kategori = \App\Models\Kategori::create(['kategori' => 'Test Category']);
        
        $barang = Barang::create([
            'nama_barang' => 'Low Stock Item',
            'kategori_id' => $kategori->id,
            'stok' => 10, // Low stock
        ]);
        
        // Create consistent outgoing transactions
        $startDate = Carbon::now()->subDays(30);
        
        for ($i = 0; $i < 30; $i++) {
            LogBarang::create([
                'barang_id' => $barang->id,
                'tanggal' => $startDate->copy()->addDays($i),
                'jumlah' => 5, // Consistent daily demand
                'tipe' => 'keluar',
                'keterangan' => 'Daily demand'
            ]);
        }
        
        // Get procurement recommendations
        $recommendations = $this->service->generateProcurementRecommendations();
        
        // Basic assertions
        $this->assertIsArray($recommendations);
        $this->assertArrayHasKey('items', $recommendations);
        $this->assertNotEmpty($recommendations['items']);
        
        // Check if our low stock item is recommended for procurement
        $found = false;
        foreach ($recommendations['items'] as $item) {
            if ($item['item_id'] === $barang->id) {
                $found = true;
                $this->assertGreaterThan(0, $item['recommended_purchase']);
                $this->assertEquals('high', $item['urgency']); // Should be high urgency
                break;
            }
        }
        
        $this->assertTrue($found, 'Low stock item should be recommended for procurement');
    }
    
    /** @test */
    public function it_can_classify_item_movement()
    {
        // Create test data
        $kategori = \App\Models\Kategori::create(['kategori' => 'Test Category']);
        
        // Fast moving item
        $fastMovingItem = Barang::create([
            'nama_barang' => 'Fast Moving Item',
            'kategori_id' => $kategori->id,
            'stok' => 100,
        ]);
        
        // Dead stock item
        $deadStockItem = Barang::create([
            'nama_barang' => 'Dead Stock Item',
            'kategori_id' => $kategori->id,
            'stok' => 100,
        ]);
        
        // Create transactions for fast moving item
        $startDate = Carbon::now()->subDays(90);
        
        for ($i = 0; $i < 20; $i++) { // High frequency
            LogBarang::create([
                'barang_id' => $fastMovingItem->id,
                'tanggal' => $startDate->copy()->addDays($i * 3), // Every 3 days
                'jumlah' => 10, // High volume
                'tipe' => 'keluar',
                'keterangan' => 'Fast moving transaction'
            ]);
        }
        
        // No transactions for dead stock item
        
        // Get movement classification
        $classification = $this->service->classifyItemMovement();
        
        // Basic assertions
        $this->assertIsArray($classification);
        $this->assertArrayHasKey('items', $classification);
        $this->assertArrayHasKey('summary', $classification);
        $this->assertNotEmpty($classification['items']);
        
        // Check if items are classified correctly
        $fastMovingFound = false;
        $deadStockFound = false;
        
        foreach ($classification['items'] as $item) {
            if ($item['id'] === $fastMovingItem->id) {
                $fastMovingFound = true;
                $this->assertEquals('Fast Moving', $item['classification']);
            }
            
            if ($item['id'] === $deadStockItem->id) {
                $deadStockFound = true;
                $this->assertEquals('Dead Stock', $item['classification']);
            }
        }
        
        $this->assertTrue($fastMovingFound, 'Fast moving item should be classified correctly');
        $this->assertTrue($deadStockFound, 'Dead stock item should be classified correctly');
    }
}
