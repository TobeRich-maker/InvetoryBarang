<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BarangController extends Controller
{
    /**
     * Display a listing of the resource with filtering and pagination.
     */
    public function index(Request $request)
    {
        $query = Barang::query();

        // Filter by category
        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // Filter by search term (search in kode_barang and nama_barang)
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('kode_barang', 'like', "%{$searchTerm}%")
                  ->orWhere('nama_barang', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by stock level
        if ($request->has('min_stok')) {
            $query->where('stok', '>=', $request->min_stok);
        }

        if ($request->has('max_stok')) {
            $query->where('stok', '<=', $request->max_stok);
        }

        // Filter by creation date
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Sort results
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['kode_barang', 'nama_barang', 'kategori', 'stok', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        // Validate sort direction
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }
        
        $query->orderBy($sortField, $sortDirection);

        // Paginate results
        $perPage = $request->input('per_page', 15);
        
        // Validate per_page to ensure it's within reasonable limits
        if (!is_numeric($perPage) || $perPage < 1 || $perPage > 100) {
            $perPage = 15;
        }
        
        $barangs = $query->paginate($perPage);

        // Get unique categories for filtering options
        $categories = Barang::distinct()->pluck('kategori');

        return response()->json([
            'data' => $barangs->items(),
            'pagination' => [
                'total' => $barangs->total(),
                'per_page' => $barangs->perPage(),
                'current_page' => $barangs->currentPage(),
                'last_page' => $barangs->lastPage(),
                'from' => $barangs->firstItem(),
                'to' => $barangs->lastItem(),
            ],
            'filters' => [
                'categories' => $categories,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_barang' => 'required|string|max:50|unique:barangs',
            'nama_barang' => 'required|string|max:255',
            'kategori' => 'nullable|string|max:100',
            'stok' => 'required|integer|min:0',
            'satuan' => 'required|string|max:50',
        ]);

        $barang = Barang::create($validated);

        return response()->json($barang, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Barang $barang)
    {
        return response()->json($barang);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'kode_barang' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('barangs')->ignore($barang->id),
            ],
            'nama_barang' => 'sometimes|string|max:255',
            'kategori' => 'nullable|string|max:100',
            'stok' => 'sometimes|integer|min:0',
            'satuan' => 'sometimes|string|max:50',
        ]);

        $barang->update($validated);

        return response()->json($barang);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Barang $barang)
    {
        $barang->delete();

        return response()->json(null, 204);
    }

    /**
     * Find an item by barcode.
     */
    public function findByBarcode($barcode)
    {
        $barang = Barang::where('barcode', $barcode)->first();
        
        if (!$barang) {
            return response()->json([
                'message' => 'Item not found with this barcode.',
                'barcode' => $barcode
            ], 404);
        }
        
        return response()->json($barang);
    }
}
