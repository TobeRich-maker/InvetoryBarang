<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\LogBarangController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint - publicly accessible
Route::get('/health', function () {
    try {
        // Check database connection
        \DB::connection()->getPdo();
        $dbStatus = true;
    } catch (\Exception $e) {
        $dbStatus = false;
        Log::error('Database connection failed', [
            'error' => $e->getMessage(),
        ]);
    }

    $user = auth()->user();

    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'database' => $dbStatus ? 'connected' : 'disconnected',
        'app_env' => config('app.env'),
        'session_status' => session()->isStarted() ? 'started' : 'not started',
        'csrf_token' => csrf_token(), // Include CSRF token for debugging
        'authenticated' => $user ? true : false,
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ? $user->role->name : null,
        ] : null,
        'request_headers' => collect(request()->headers->all())
            ->map(function ($header) {
                return is_array($header) && count($header) === 1 ? $header[0] : $header;
            })
            ->toArray(),
    ]);
});

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Test route to check token
Route::middleware('auth:sanctum')->get('/test-auth', function () {
    return response()->json([
        'message' => 'Authenticated',
        'user' => auth()->user()->load('role'),
    ]);
});


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);

    // Role and Permission Management (admin only)
    Route::middleware('permission:manage_roles')->group(function () {
        Route::apiResource('roles', RoleController::class);
        Route::post('roles/{role}/permissions', [RoleController::class, 'assignPermissions']);
        
        Route::apiResource('permissions', PermissionController::class);
        Route::get('permissions-grouped', [PermissionController::class, 'grouped']);
    });

    // User management routes (requires manage_users permission)
    Route::middleware('permission:manage_users')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Barang routes - requires manage_items permission
    Route::apiResource('barang', BarangController::class)->middleware('permission:manage_items');

    // Log Barang routes - requires manage_transactions permission
    Route::prefix('log-barang')->middleware('permission:manage_transactions')->group(function () {
        Route::get('/', [LogBarangController::class, 'index']);
        Route::post('/', [LogBarangController::class, 'store']);
        Route::get('/{logBarang}', [LogBarangController::class, 'show']);
    });
    
    // View logs - requires view_transactions permission
    Route::get('barang/{barang}/logs', [LogBarangController::class, 'getLogsByBarang'])
        ->middleware('permission:view_transactions');

    // Category routes - requires view_categories permission
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/stock-summary', [CategoryController::class, 'stockSummary']);

    // Export routes - requires export_data permission
    Route::prefix('export')->middleware('permission:export_data')->group(function () {
        Route::get('/items/excel', [ExportController::class, 'exportItemsToExcel']);
        Route::get('/items/pdf', [ExportController::class, 'exportItemsToPdf']);
        Route::get('/transactions/excel', [ExportController::class, 'exportTransactionsToExcel']);
        Route::get('/transactions/pdf', [ExportController::class, 'exportTransactionsToPdf']);
    });

    // Barcode lookup - requires view_items permission
    Route::get('/barcode/{barcode}', [BarangController::class, 'findByBarcode'])
        ->middleware('permission:view_items');
        
    // Analytics routes
    Route::middleware('permission:view_reports')->get('/test-permission', function () {
    return 'Boleh akses';
});

    Route::prefix('analytics')->middleware('permission:view_reports')->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'getDashboardData']);
        Route::get('/forecasts', [AnalyticsController::class, 'getDemandForecasts']);
        Route::get('/anomalies', [AnalyticsController::class, 'getAnomalies']);
        Route::get('/procurement', [AnalyticsController::class, 'getProcurementRecommendations']);
        Route::get('/movement', [AnalyticsController::class, 'getItemMovementClassification']);
    });
    
    // Admin routes - now using permission-based middleware instead of role-based
    Route::prefix('admin')->middleware('permission:manage_system')->group(function () {
        Route::get('/system-stats', [AdminController::class, 'getSystemStats']);
        Route::get('/system-logs', [AdminController::class, 'getSystemLogs']);
        Route::post('/database-maintenance', [AdminController::class, 'runDatabaseMaintenance']);
        Route::get('/system-settings', [AdminController::class, 'getSystemSettings']);
        Route::post('/system-settings', [AdminController::class, 'updateSystemSettings']);
    });
});

// Log all API requests for debugging
Route::middleware('api')->group(function () {
    Route::any('{any}', function ($any) {
        Log::debug('API Request', [
            'path' => request()->path(),
            'method' => request()->method(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'authenticated' => auth()->check() ? 'yes' : 'no',
        ]);
        return response()->json(['message' => 'Route not found'], 404);
    })->where('any', '.*')->fallback();
});
