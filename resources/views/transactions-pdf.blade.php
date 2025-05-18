<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Transaction Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
        }
        table th {
            background-color: #f2f2f2;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .summary {
            margin: 20px 0;
        }
        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 10px;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Transaction Report: {{ $filterDesc }}</h1>
        <p>Generated on: {{ date('Y-m-d H:i:s') }}</p>
    </div>
    
    <div class="summary">
        <table>
            <tr>
                <th>Total Transactions</th>
                <th>Total Quantity</th>
                <th>Total Value</th>
            </tr>
            <tr>
                <td>{{ $transactions->count() }}</td>
                <td>{{ $totalQuantity }}</td>
                <td>{{ number_format($totalValue, 2) }}</td>
            </tr>
        </table>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Processed By</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $transaction)
            @php
                $itemPrice = $transaction->barang->harga ?? 0;
                $totalValue = $itemPrice * $transaction->jumlah;
            @endphp
            <tr>
                <td>{{ $transaction->tanggal }}</td>
                <td>{{ $transaction->barang ? $transaction->barang->kode_barang : 'N/A' }}</td>
                <td>{{ $transaction->barang ? $transaction->barang->nama_barang : 'N/A' }}</td>
                <td>{{ $transaction->jumlah }}</td>
                <td>{{ $transaction->barang ? $transaction->barang->satuan : 'N/A' }}</td>
                <td>{{ number_format($itemPrice, 2) }}</td>
                <td>{{ number_format($totalValue, 2) }}</td>
                <td>{{ $transaction->user ? $transaction->user->name : 'Unknown' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="footer">
        <p>Inventory Management System - {{ config('app.name') }}</p>
    </div>
</body>
</html>
