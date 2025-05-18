<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\LogBarangController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AdminController;

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

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Debug route - no auth required
Route::get('/debug-auth', [AuthController::class, 'debugAuth']);

// Test auth route
Route::get('/test-auth', function (Request $request) {
   return response()->json([
       'message' => 'Authentication successful',
       'user' => $request->user() ? [
           'id' => $request->user()->id,
           'name' => $request->user()->name,
           'email' => $request->user()->email,
       ] : null,
       'authenticated' => $request->user() !== null,
   ]);
})->middleware('auth:sanctum');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
   // Auth routes
   Route::get('/user', [AuthController::class, 'user']);
   Route::post('/logout', [AuthController::class, 'logout']);
   Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
   
   // Barang routes
   Route::apiResource('barang', BarangController::class);
   Route::get('/barang/search/{term}', [BarangController::class, 'search']);
   Route::get('/barang/barcode/{barcode}', [BarangController::class, 'findByBarcode']);
   
   // Log Barang routes
   Route::apiResource('log-barang', LogBarangController::class);
   Route::post('/log-barang/goods-in', [LogBarangController::class, 'goodsIn']);
   Route::post('/log-barang/goods-out', [LogBarangController::class, 'goodsOut']);
   
   // Category routes - IMPORTANT: Put specific routes before resource routes
   Route::get('/categories/stock-summary', [CategoryController::class, 'stockSummary']);
   Route::apiResource('categories', CategoryController::class);
   
   // Export routes
   Route::get('/export/items', [ExportController::class, 'exportItems']);
   Route::get('/export/transactions', [ExportController::class, 'exportTransactions']);
   
   // Analytics routes
   Route::prefix('analytics')->group(function () {
       Route::get('/dashboard', [AnalyticsController::class, 'getDashboardData']);
       Route::get('/forecasts', [AnalyticsController::class, 'forecasts']);
       Route::get('/anomalies', [AnalyticsController::class, 'anomalies']);
       Route::get('/procurement', [AnalyticsController::class, 'procurement']);
       Route::get('/movement', [AnalyticsController::class, 'movement']);
   });
   
   // Admin routes
   Route::prefix('admin')->middleware('permission:manage_system')->group(function () {
       Route::get('/system-info', [AdminController::class, 'systemInfo']);
       Route::get('/logs', [AdminController::class, 'logs']);
       Route::post('/clear-cache', [AdminController::class, 'clearCache']);
   });
   
   // Role and Permission routes
   Route::middleware('permission:manage_roles')->group(function () {
       Route::apiResource('roles', RoleController::class);
       Route::post('roles/{role}/permissions', [RoleController::class, 'assignPermissions']);
       
       Route::apiResource('permissions', PermissionController::class);
       Route::get('permissions-grouped', [PermissionController::class, 'grouped']);
   });
   
   // User management routes
   Route::middleware('permission:manage_users')->group(function () {
       Route::apiResource('users', UserController::class);
       Route::post('users/{user}/role', [UserController::class, 'assignRole']);
   });
});
