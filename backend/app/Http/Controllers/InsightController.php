<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class InsightController extends Controller
{
    public function generate(Request $request)
    {
        $user = $request->user();
        
        $currentMonth = Carbon::now()->format('Y-m');
        $lastMonth = Carbon::now()->subMonth()->format('Y-m');

        // Fetch current month expenses
        $currentExpenses = $user->transactions()
            ->where('type', 'expense')
            ->whereMonth('transaction_date', substr($currentMonth, 5, 2))
            ->whereYear('transaction_date', substr($currentMonth, 0, 4))
            ->get();

        // Fetch last month expenses
        $lastExpenses = $user->transactions()
            ->where('type', 'expense')
            ->whereMonth('transaction_date', substr($lastMonth, 5, 2))
            ->whereYear('transaction_date', substr($lastMonth, 0, 4))
            ->get();

        $currentTotal = floatval($currentExpenses->sum('amount'));
        $lastTotal = floatval($lastExpenses->sum('amount'));

        // Calculate MoM percentage change
        $percentageChange = 0;
        $direction = 'stable';
        if ($lastTotal > 0) {
            $diff = $currentTotal - $lastTotal;
            $percentageChange = round(($diff / $lastTotal) * 100);
            $direction = $diff > 0 ? 'up' : ($diff < 0 ? 'down' : 'stable');
        } elseif ($currentTotal > 0) {
            $percentageChange = 100;
            $direction = 'up';
        }

        // Group and find highest spending category
        $categoryBreakdown = $currentExpenses->groupBy('category')
            ->map(fn($group) => $group->sum('amount'));

        $highestCategory = 'None';
        $highestAmount = 0.0;

        if ($categoryBreakdown->count() > 0) {
            $highestCategory = $categoryBreakdown->keys()->first();
            $highestAmount = floatval($categoryBreakdown->first());
            
            foreach ($categoryBreakdown as $cat => $amt) {
                if ($amt > $highestAmount) {
                    $highestCategory = $cat;
                    $highestAmount = floatval($amt);
                }
            }
        }

        // Generate tailored suggestions
        $suggestions = [];
        if ($direction === 'up' && $percentageChange > 15) {
            $suggestions[] = "📈 Warning: Your spending increased by {$percentageChange}% this month. Consider checking for recent impulse purchases.";
        } elseif ($direction === 'down' && $percentageChange > 10) {
            $suggestions[] = "🎉 Outstanding! You've successfully reduced your spending by " . abs($percentageChange) . "% compared to last month.";
        } else {
            $suggestions[] = "💡 Good work! Your budget pacing is fairly stable compared to last month.";
        }

        if ($highestAmount > 0) {
            $suggestions[] = "🍔 Highest Expense Sector: {$highestCategory} is your peak area at " . number_format($highestAmount, 2) . ".";
            
            if ($highestCategory === 'Food' || $highestCategory === 'Shopping') {
                $targetSavings = round($highestAmount * 0.20);
                $suggestions[] = "🎯 Savings Tip: Reducing {$highestCategory} by just 20% would redirect " . number_format($targetSavings, 2) . " back into your savings accounts.";
            } else {
                $suggestions[] = "🎯 Check for overlapping subscriptions or minor hidden transactions under your {$highestCategory} logs.";
            }
        } else {
            $suggestions[] = "📋 Set up monthly targets and log transactions regularly to receive AI recommendations.";
        }

        return response()->json([
            'percentage_change' => abs($percentageChange),
            'direction' => $direction,
            'highest_category' => $highestCategory,
            'highest_amount' => $highestAmount,
            'comparative_text' => $direction === 'up' 
                ? "You spent {$percentageChange}% more this month than last month." 
                : ($direction === 'down' ? "You spent " . abs($percentageChange) . "% less than last month." : "Your spending is identical to last month."),
            'highest_category_text' => $highestAmount > 0 
                ? "Your highest spending category: {$highestCategory} (" . number_format($highestAmount, 2) . ")" 
                : "No expenses recorded this month.",
            'suggestions' => $suggestions,
            'timestamp' => Carbon::now()->toIso8601String()
        ]);
    }
}
