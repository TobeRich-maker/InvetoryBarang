<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\LogBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use PDF;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Writer\Csv;

class ExportController extends Controller
{
    /**
     * Export items to Excel/CSV
     */
    public function exportItemsToExcel(Request $request)
    {
        // Check permissions
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasRole('staff')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $format = $request->input('format', 'xlsx');
        $items = Barang::all();
        
        // Create new spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $sheet->setCellValue('A1', 'Item Code');
        $sheet->setCellValue('B1', 'Barcode');
        $sheet->setCellValue('C1', 'Name');
        $sheet->setCellValue('D1', 'Category');
        $sheet->setCellValue('E1', 'Stock');
        $sheet->setCellValue('F1', 'Unit');
        $sheet->setCellValue('G1', 'Price');
        
        // Add data
        $row = 2;
        foreach ($items as $item) {
            $sheet->setCellValue('A' . $row, $item->kode_barang);
            $sheet->setCellValue('B' . $row, $item->barcode);
            $sheet->setCellValue('C' . $row, $item->nama_barang);
            $sheet->setCellValue('D' . $row, $item->kategori);
            $sheet->setCellValue('E' . $row, $item->stok);
            $sheet->setCellValue('F' . $row, $item->satuan);
            $sheet->setCellValue('G' . $row, $item->harga);
            $row++;
        }
        
        // Auto size columns
        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        // Create response
        $filename = 'inventory_items_' . date('Y-m-d') . '.' . $format;
        
        // Create the writer
        if ($format == 'csv') {
            $writer = new Csv($spreadsheet);
        } else {
            $writer = new Xlsx($spreadsheet);
        }
        
        // Save to temp file
        $temp_file = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($temp_file);
        
        // Return download response
        return response()->download($temp_file, $filename, [
            'Content-Type' => $format == 'csv' 
                ? 'text/csv' 
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
    
    /**
     * Export items to PDF
     */
    public function exportItemsToPdf()
    {
        // Check permissions
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasRole('staff')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $items = Barang::all();
        $pdf = PDF::loadView('exports.items-pdf', ['items' => $items]);
        
        return $pdf->download('inventory_items_' . date('Y-m-d') . '.pdf');
    }
    
    /**
     * Export transactions to Excel/CSV
     */
    public function exportTransactionsToExcel(Request $request)
    {
        // Check permissions
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasRole('staff')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $format = $request->input('format', 'xlsx');
        $filter = $request->input('filter', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        $query = LogBarang::with(['barang', 'user'])
            ->where('tipe', 'keluar');
        
        // Apply date filters
        switch ($filter) {
            case 'today':
                $query->whereDate('tanggal', Carbon::today());
                break;
            case 'month':
                $query->whereMonth('tanggal', Carbon::now()->month)
                    ->whereYear('tanggal', Carbon::now()->year);
                break;
            case 'year':
                $query->whereYear('tanggal', Carbon::now()->year);
                break;
            case 'custom':
                if ($startDate) {
                    $query->whereDate('tanggal', '>=', $startDate);
                }
                if ($endDate) {
                    $query->whereDate('tanggal', '<=', $endDate);
                }
                break;
        }
        
        $transactions = $query->orderBy('tanggal', 'desc')->get();
        
        // Create new spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $sheet->setCellValue('A1', 'Transaction Date');
        $sheet->setCellValue('B1', 'Item Code');
        $sheet->setCellValue('C1', 'Item Name');
        $sheet->setCellValue('D1', 'Quantity');
        $sheet->setCellValue('E1', 'Unit');
        $sheet->setCellValue('F1', 'Unit Price');
        $sheet->setCellValue('G1', 'Total Value');
        $sheet->setCellValue('H1', 'Processed By');
        $sheet->setCellValue('I1', 'Notes');
        
        // Add data
        $row = 2;
        foreach ($transactions as $transaction) {
            $itemPrice = $transaction->barang->harga ?? 0;
            $totalValue = $itemPrice * $transaction->jumlah;
            
            $sheet->setCellValue('A' . $row, $transaction->tanggal);
            $sheet->setCellValue('B' . $row, $transaction->barang ? $transaction->barang->kode_barang : 'N/A');
            $sheet->setCellValue('C' . $row, $transaction->barang ? $transaction->barang->nama_barang : 'N/A');
            $sheet->setCellValue('D' . $row, $transaction->jumlah);
            $sheet->setCellValue('E' . $row, $transaction->barang ? $transaction->barang->satuan : 'N/A');
            $sheet->setCellValue('F' . $row, $itemPrice);
            $sheet->setCellValue('G' . $row, $totalValue);
            $sheet->setCellValue('H' . $row, $transaction->user ? $transaction->user->name : 'Unknown');
            $sheet->setCellValue('I' . $row, $transaction->keterangan);
            $row++;
        }
        
        // Auto size columns
        foreach (range('A', 'I') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        // Create filename
        $filterDesc = match($filter) {
            'today' => 'today',
            'month' => 'month_' . date('Y-m'),
            'year' => 'year_' . date('Y'),
            'custom' => $startDate . '_to_' . $endDate,
            default => 'all'
        };
        
        $filename = 'transactions_' . $filterDesc . '.' . $format;
        
        // Create the writer
        if ($format == 'csv') {
            $writer = new Csv($spreadsheet);
        } else {
            $writer = new Xlsx($spreadsheet);
        }
        
        // Save to temp file
        $temp_file = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($temp_file);
        
        // Return download response
        return response()->download($temp_file, $filename, [
            'Content-Type' => $format == 'csv' 
                ? 'text/csv' 
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
    
    /**
     * Export transactions to PDF
     */
    public function exportTransactionsToPdf(Request $request)
    {
        // Check permissions
        if (!auth()->user()->hasRole('admin') && !auth()->user()->hasRole('staff')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $filter = $request->input('filter', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        $query = LogBarang::with(['barang', 'user'])
            ->where('tipe', 'keluar');
        
        // Apply date filters
        switch ($filter) {
            case 'today':
                $query->whereDate('tanggal', Carbon::today());
                break;
            case 'month':
                $query->whereMonth('tanggal', Carbon::now()->month)
                    ->whereYear('tanggal', Carbon::now()->year);
                break;
            case 'year':
                $query->whereYear('tanggal', Carbon::now()->year);
                break;
            case 'custom':
                if ($startDate) {
                    $query->whereDate('tanggal', '>=', $startDate);
                }
                if ($endDate) {
                    $query->whereDate('tanggal', '<=', $endDate);
                }
                break;
        }
        
        $transactions = $query->orderBy('tanggal', 'desc')->get();
        
        // Calculate totals
        $totalQuantity = $transactions->sum('jumlah');
        $totalValue = $transactions->sum(function ($transaction) {
            return ($transaction->barang->harga ?? 0) * $transaction->jumlah;
        });
        
        $filterDesc = match($filter) {
            'today' => 'Today (' . date('Y-m-d') . ')',
            'month' => 'Month (' . date('F Y') . ')',
            'year' => 'Year (' . date('Y') . ')',
            'custom' => 'Period: ' . $startDate . ' to ' . $endDate,
            default => 'All Time'
        };
        
        $pdf = PDF::loadView('exports.transactions-pdf', [
            'transactions' => $transactions,
            'filterDesc' => $filterDesc,
            'totalQuantity' => $totalQuantity,
            'totalValue' => $totalValue
        ]);
        
        return $pdf->download('transactions_' . strtolower(str_replace(' ', '_', $filterDesc)) . '.pdf');
    }
}
