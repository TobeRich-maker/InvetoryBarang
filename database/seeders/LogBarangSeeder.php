<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\LogBarang;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LogBarangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all barang and users
        $barangs = Barang::all();
        $users = User::all();
        
        // Get admin and staff users
        $adminUser = User::whereHas('role', function($query) {
            $query->where('name', 'admin');
        })->first();
        
        $staffUser = User::whereHas('role', function($query) {
            $query->where('name', 'staff');
        })->first();

        // Create initial stock entries (all items coming in)
        foreach ($barangs as $barang) {
            LogBarang::create([
                'barang_id' => $barang->id,
                'user_id' => $adminUser->id,
                'tipe' => 'masuk',
                'jumlah' => $barang->stok,
                'keterangan' => 'Initial stock',
                'tanggal' => Carbon::now()->subDays(30),
            ]);
        }

        // Create some random incoming entries
        for ($i = 0; $i < 50; $i++) {
            $barang = $barangs->random();
            $user = $users->random();
            $date = Carbon::now()->subDays(rand(1, 29));
            
            $quantity = rand(5, 20);
            
            LogBarang::create([
                'barang_id' => $barang->id,
                'user_id' => $user->id,
                'tipe' => 'masuk',
                'jumlah' => $quantity,
                'keterangan' => 'Restocking',
                'tanggal' => $date,
            ]);
        }

        // Create some random outgoing entries
        for ($i = 0; $i < 30; $i++) {
            $barang = $barangs->random();
            $user = $users->random();
            $date = Carbon::now()->subDays(rand(1, 28));
            
            // Make sure we don't take out more than what's available
            $maxQuantity = min(5, $barang->stok);
            $quantity = $maxQuantity > 0 ? rand(1, $maxQuantity) : 0;
            
            if ($quantity > 0) {
                LogBarang::create([
                    'barang_id' => $barang->id,
                    'user_id' => $user->id,
                    'tipe' => 'keluar',
                    'jumlah' => $quantity,
                    'keterangan' => 'Regular usage',
                    'tanggal' => $date,
                ]);
                
                // Update the stock
                $barang->stok -= $quantity;
                $barang->save();
            }
        }
    }
}
