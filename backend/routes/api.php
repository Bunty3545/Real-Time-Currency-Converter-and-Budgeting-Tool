<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GuestAuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\InsightController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\RecurringController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/guest-login', [GuestAuthController::class, 'guestLogin']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Transactions
    Route::get('/transactions/summary', [TransactionController::class, 'summary']);
    Route::apiResource('transactions', TransactionController::class);

    // Budgets
    Route::apiResource('budgets', BudgetController::class)->except(['update', 'destroy']);
    Route::get('/budgets/month/{month}', [BudgetController::class, 'show']);

    // Exchange Rates
    Route::get('/exchange-rates', [ExchangeRateController::class, 'index']);
    Route::post('/exchange-rates/sync', [ExchangeRateController::class, 'sync']);

    // Redesigned Dashboards & Analytics Endpoint
    Route::get('/dashboard-data', [DashboardController::class, 'getDashboardData']);
    Route::get('/budget-vs-actual', [DashboardController::class, 'budgetVsActual']);
    Route::post('/budgets/save', [DashboardController::class, 'saveBudget']);
    Route::get('/monthly-statement', [DashboardController::class, 'monthlyStatement']);
    Route::get('/monthly-statement/export/csv', [DashboardController::class, 'exportCSV']);
    Route::get('/monthly-statement/export/excel', [DashboardController::class, 'exportExcel']);
    Route::get('/monthly-statement/export/pdf', [DashboardController::class, 'exportPDF']);
    Route::get('/insights', [InsightController::class, 'generate']);

    // Direct Transaction Controller Exports
    Route::get('/transactions/export/csv', [TransactionController::class, 'exportCSV']);
    Route::get('/transactions/export/excel', [TransactionController::class, 'exportExcel']);
    Route::get('/transactions/export/pdf', [TransactionController::class, 'exportPDF']);

    // Notifications Feeds
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/mark-read/{id}', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

    // Recurring Billing Configurations
    Route::get('/recurring', [RecurringController::class, 'index']);
    Route::post('/recurring', [RecurringController::class, 'store']);
    Route::delete('/recurring/{id}', [RecurringController::class, 'destroy']);
    
    // Additional placeholders mapped to unified APIs
    Route::get('/budget-comparison', [BudgetController::class, 'index']);
    Route::get('/yearly-report', [DashboardController::class, 'getDashboardData']);
});

