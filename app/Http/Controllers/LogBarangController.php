<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\LogBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LogBarangController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(LogBarang::with(['barang', 'user'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'barang_id' => 'required|exists:barangs,id',
            'tipe' => 'required|in:masuk,keluar',
            'jumlah' => 'required|integer|min:1',
            'keterangan' => 'nullable|string',
            'tanggal' => 'required|date',
        ]);

        // Add user_id from authenticated user
        $validated['user_id'] = $request->user()->id;

        // Start a database transaction
        return DB::transaction(function () use ($validated) {
            $barang = Barang::findOrFail($validated['barang_id']);

            // Check if there's enough stock for outgoing items
            if ($validated['tipe'] === 'keluar' && $barang->stok < $validated['jumlah']) {
                return response()->json([
                    'message' => 'Stok tidak mencukupi',
                ], 422);
            }

            // Update stock
            if ($validated['tipe'] === 'masuk') {
                $barang->stok += $validated['jumlah'];
            } else {
                $barang->stok -= $validated['jumlah'];
            }
            $barang->save();

            // Create log entry
            $log = LogBarang::create($validated);
            $log->load(['barang', 'user']);

            return response()->json($log, 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(LogBarang $logBarang)
    {
        $logBarang->load(['barang', 'user']);
        return response()->json($logBarang);
    }

    /**
     * Get logs for a specific barang.
     */
    public function getLogsByBarang($barangId)
    {
        $logs = LogBarang::where('barang_id', $barangId)
            ->with(['barang', 'user'])
            ->orderBy('tanggal', 'desc')
            ->get();

        return response()->json($logs);
    }
}
