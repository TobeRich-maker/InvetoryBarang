<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Barang;
use App\Models\LogBarang;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    /**
     * Get system statistics for admin dashboard
     */
    public function getSystemStats()
    {
        try {
            $stats = [
                'users' => User::count(),
                'roles' => Role::count(),
                'permissions' => Permission::count(),
                'items' => Barang::count(),
                'transactions' => LogBarang::count(),
            ];
            
            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Failed to get system stats: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get system stats'], 500);
        }
    }
    
    /**
     * Get system logs
     */
    public function getSystemLogs(Request $request)
    {
        try {
            // Get the latest log file
            $logPath = storage_path('logs/laravel.log');
            
            if (!file_exists($logPath)) {
                return response()->json(['logs' => 'No logs found'], 404);
            }
            
            // Read the last 100 lines of the log file
            $logs = [];
            $file = new \SplFileObject($logPath, 'r');
            $file->seek(PHP_INT_MAX); // Seek to the end of file
            $totalLines = $file->key(); // Get total lines
            
            $linesToRead = min(100, $totalLines);
            $startLine = max(0, $totalLines - $linesToRead);
            
            $file->seek($startLine);
            
            while (!$file->eof()) {
                $line = $file->current();
                if (!empty(trim($line))) {
                    $logs[] = $line;
                }
                $file->next();
            }
            
            return response()->json(['logs' => $logs]);
        } catch (\Exception $e) {
            Log::error('Failed to get system logs: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get system logs'], 500);
        }
    }
    
    /**
     * Run database maintenance
     */
    public function runDatabaseMaintenance()
    {
        try {
            // This is just an example - in a real application you would
            // implement actual database maintenance tasks
            DB::statement('ANALYZE TABLE users');
            DB::statement('ANALYZE TABLE roles');
            DB::statement('ANALYZE TABLE permissions');
            DB::statement('ANALYZE TABLE barangs');
            DB::statement('ANALYZE TABLE log_barang');
            
            return response()->json(['message' => 'Database maintenance completed successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to run database maintenance: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to run database maintenance'], 500);
        }
    }
    
    /**
     * Get system settings
     */
    public function getSystemSettings()
    {
        // In a real application, you would fetch these from a settings table
        $settings = [
            'app_name' => config('app.name'),
            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
            'app_url' => config('app.url'),
            'database_connection' => config('database.default'),
            'mail_mailer' => config('mail.default'),
            'cache_driver' => config('cache.default'),
            'session_driver' => config('session.driver'),
            'queue_connection' => config('queue.default'),
        ];
        
        return response()->json($settings);
    }
    
    /**
     * Update system settings
     */
    public function updateSystemSettings(Request $request)
    {
        // In a real application, you would validate and save these to a settings table
        // This is just a placeholder implementation
        return response()->json(['message' => 'Settings updated successfully']);
    }
}
