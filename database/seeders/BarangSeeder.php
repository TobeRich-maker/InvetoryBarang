<?php

namespace Database\Seeders;

use App\Models\Barang;
use Illuminate\Database\Seeder;

class BarangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            // Electronics
            [
                'kode_barang' => 'EL001',
                'nama_barang' => 'Laptop Dell XPS 13',
                'kategori' => 'Electronics',
                'stok' => 15,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'EL002',
                'nama_barang' => 'Monitor LG 24"',
                'kategori' => 'Electronics',
                'stok' => 25,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'EL003',
                'nama_barang' => 'Keyboard Mechanical',
                'kategori' => 'Electronics',
                'stok' => 30,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'EL004',
                'nama_barang' => 'Mouse Wireless',
                'kategori' => 'Electronics',
                'stok' => 40,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'EL005',
                'nama_barang' => 'Headphone Bluetooth',
                'kategori' => 'Electronics',
                'stok' => 20,
                'satuan' => 'unit',
            ],
            
            // Office Supplies
            [
                'kode_barang' => 'OF001',
                'nama_barang' => 'Ballpoint Pen',
                'kategori' => 'Office Supplies',
                'stok' => 200,
                'satuan' => 'pcs',
            ],
            [
                'kode_barang' => 'OF002',
                'nama_barang' => 'A4 Paper',
                'kategori' => 'Office Supplies',
                'stok' => 100,
                'satuan' => 'rim',
            ],
            [
                'kode_barang' => 'OF003',
                'nama_barang' => 'Stapler',
                'kategori' => 'Office Supplies',
                'stok' => 50,
                'satuan' => 'pcs',
            ],
            [
                'kode_barang' => 'OF004',
                'nama_barang' => 'Paper Clips',
                'kategori' => 'Office Supplies',
                'stok' => 300,
                'satuan' => 'box',
            ],
            [
                'kode_barang' => 'OF005',
                'nama_barang' => 'Sticky Notes',
                'kategori' => 'Office Supplies',
                'stok' => 150,
                'satuan' => 'pack',
            ],
            
            // Furniture
            [
                'kode_barang' => 'FR001',
                'nama_barang' => 'Office Chair',
                'kategori' => 'Furniture',
                'stok' => 20,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'FR002',
                'nama_barang' => 'Office Desk',
                'kategori' => 'Furniture',
                'stok' => 15,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'FR003',
                'nama_barang' => 'Filing Cabinet',
                'kategori' => 'Furniture',
                'stok' => 10,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'FR004',
                'nama_barang' => 'Bookshelf',
                'kategori' => 'Furniture',
                'stok' => 8,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'FR005',
                'nama_barang' => 'Meeting Table',
                'kategori' => 'Furniture',
                'stok' => 5,
                'satuan' => 'unit',
            ],
            
            // IT Equipment
            [
                'kode_barang' => 'IT001',
                'nama_barang' => 'Router Wireless',
                'kategori' => 'IT Equipment',
                'stok' => 12,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'IT002',
                'nama_barang' => 'Network Switch',
                'kategori' => 'IT Equipment',
                'stok' => 8,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'IT003',
                'nama_barang' => 'External Hard Drive',
                'kategori' => 'IT Equipment',
                'stok' => 15,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'IT004',
                'nama_barang' => 'UPS Battery Backup',
                'kategori' => 'IT Equipment',
                'stok' => 10,
                'satuan' => 'unit',
            ],
            [
                'kode_barang' => 'IT005',
                'nama_barang' => 'Network Cable',
                'kategori' => 'IT Equipment',
                'stok' => 100,
                'satuan' => 'meter',
            ],
            
            // Maintenance
            [
                'kode_barang' => 'MT001',
                'nama_barang' => 'Cleaning Supplies',
                'kategori' => 'Maintenance',
                'stok' => 50,
                'satuan' => 'set',
            ],
            [
                'kode_barang' => 'MT002',
                'nama_barang' => 'Light Bulbs',
                'kategori' => 'Maintenance',
                'stok' => 100,
                'satuan' => 'pcs',
            ],
            [
                'kode_barang' => 'MT003',
                'nama_barang' => 'Air Freshener',
                'kategori' => 'Maintenance',
                'stok' => 30,
                'satuan' => 'bottle',
            ],
            [
                'kode_barang' => 'MT004',
                'nama_barang' => 'Trash Bags',
                'kategori' => 'Maintenance',
                'stok' => 200,
                'satuan' => 'pack',
            ],
            [
                'kode_barang' => 'MT005',
                'nama_barang' => 'Hand Sanitizer',
                'kategori' => 'Maintenance',
                'stok' => 80,
                'satuan' => 'bottle',
            ],
        ];

        foreach ($items as $item) {
            Barang::firstOrCreate(
                ['kode_barang' => $item['kode_barang']], 
                $item
            );
        }
    }
}
