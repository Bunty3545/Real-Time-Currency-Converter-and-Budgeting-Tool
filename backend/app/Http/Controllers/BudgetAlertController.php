<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Budget;
use Carbon\Carbon;

class BudgetAlertController extends Controller
{
    public static function checkThreshold(User $user, $month)
    {
        // 1. Retrieve the budget for the specified month
        $budget = $user->budgets()->where('month', $month)->first();
        if (!$budget) {
            return;
        }

        // 2. Aggregate all expenses in the month
        $totalExpenses = $user->transactions()
            ->where('type', 'expense')
            ->whereMonth('transaction_date', substr($month, 5, 2))
            ->whereYear('transaction_date', substr($month, 0, 4))
            ->sum('amount');

        // 3. Compute ratio
        $ratio = $budget->total_budget > 0 ? ($totalExpenses / $budget->total_budget) : 0;
        
        // 4. Issue notifications
        if ($ratio >= 1.0) {
            $message = "🚨 Critical Overdraft! You have exceeded your budget cap for {$month}. Spent: " . number_format($totalExpenses, 2) . " / Limit: " . number_format($budget->total_budget, 2);
            
            // Prevent multiple alert spams on same day
            $exists = $user->notifications()
                ->where('message', 'like', '🚨 Critical Overdraft!%')
                ->whereDate('created_at', Carbon::today())
                ->exists();

            if (!$exists) {
                $user->notifications()->create([
                    'message' => $message,
                    'is_read' => false
                ]);
            }
        } elseif ($ratio >= 0.80) {
            $message = "⚠️ Budget Warning! You have consumed " . round($ratio * 100) . "% of your monthly target budget for {$month}. Spent: " . number_format($totalExpenses, 2) . " / Limit: " . number_format($budget->total_budget, 2);
            
            $exists = $user->notifications()
                ->where('message', 'like', '⚠️ Budget Warning!%')
                ->whereDate('created_at', Carbon::today())
                ->exists();

            if (!$exists) {
                $user->notifications()->create([
                    'message' => $message,
                    'is_read' => false
                ]);
            }
        }
    }
}
