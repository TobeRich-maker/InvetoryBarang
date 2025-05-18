<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Get all unique categories with item counts.
     */
    public function index()
    {
        $categories = Barang::select('kategori')
            ->selectRaw('COUNT(*) as item_count')
            ->groupBy('kategori')
            ->orderBy('kategori')
            ->get();

        return response()->json($categories);
    }

    /**
     * Get stock summary by category.
     */
    public function stockSummary()
    {
        try {
            $summary = Barang::select('kategori')
                ->selectRaw('COUNT(*) as item_count')
                ->selectRaw('SUM(stok) as total_stock')
                ->groupBy('kategori')
                ->orderBy('kategori')
                ->get();

            Log::info('Stock summary retrieved successfully', [
                'count' => $summary->count(),
                'user_id' => auth()->id()
            ]);

            return response()->json($summary);
        } catch (\Exception $e) {
            Log::error('Error retrieving stock summary', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'message' => 'Error retrieving stock summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
