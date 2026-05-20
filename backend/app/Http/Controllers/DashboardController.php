<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    /**
     * Get primary dashboard statistics and activity.
     */
    public function getDashboardData(Request $request)
    {
        $user = $request->user();
        $month = $request->get('month', Carbon::now()->format('Y-m'));
        $year = $request->get('year', Carbon::now()->format('Y'));

        // Clear cache if refresh parameter is present
        if ($request->has('refresh')) {
            Cache::forget("user_{$user->id}_dashboard_{$month}_{$year}");
        }

        $cacheKey = "user_{$user->id}_dashboard_{$month}_{$year}";

        $data = Cache::remember($cacheKey, 60, function () use ($user, $month, $year) {
            $parsedMonth = Carbon::parse($month . '-01');

            // 1. Fetch current month's transactions
            $monthlyTrans = $user->transactions()
                ->whereMonth('transaction_date', $parsedMonth->month)
                ->whereYear('transaction_date', $parsedMonth->year)
                ->get();

            $monthlyIncome = $monthlyTrans->where('type', 'income')->sum('amount');
            $monthlyExpense = $monthlyTrans->where('type', 'expense')->sum('amount');

            // 2. Fetch overall balance (All time income - expense)
            $totalIncomeAllTime = $user->transactions()->where('type', 'income')->sum('amount');
            $totalExpenseAllTime = $user->transactions()->where('type', 'expense')->sum('amount');
            $netBalance = $totalIncomeAllTime - $totalExpenseAllTime;

            // 3. Fetch monthly budget
            $budget = $user->budgets()->where('month', $month)->first();
            $monthlyBudget = $budget ? floatval($budget->total_budget) : 0;
            $budgetPercentage = $monthlyBudget > 0 ? ($monthlyExpense / $monthlyBudget) * 100 : 0;

            // 4. Category-wise expense grouping
            $categoryExpenses = [];
            $categories = ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Other'];
            foreach ($categories as $cat) {
                $categoryExpenses[$cat] = floatval($monthlyTrans->where('type', 'expense')->where('category', $cat)->sum('amount'));
            }

            // 5. Recent 5 transaction rows
            $recentTransactions = $user->transactions()
                ->orderBy('transaction_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            // 6. Year monthly trends (Optimized N+1 lookup)
            $yearlyTrans = $user->transactions()
                ->whereYear('transaction_date', $year)
                ->get();

            $yearlyTrends = [];
            for ($m = 1; $m <= 12; $m++) {
                $monthStr = sprintf('%02d', $m);
                $monthTrans = $yearlyTrans->filter(function($trans) use ($monthStr) {
                    return Carbon::parse($trans->transaction_date)->format('m') === $monthStr;
                });
                $yearlyTrends[] = [
                    'month' => Carbon::create()->month($m)->format('M'),
                    'income' => floatval($monthTrans->where('type', 'income')->sum('amount')),
                    'expense' => floatval($monthTrans->where('type', 'expense')->sum('amount')),
                ];
            }

            return [
                'net_balance' => floatval($netBalance),
                'monthly_income' => floatval($monthlyIncome),
                'monthly_expense' => floatval($monthlyExpense),
                'monthly_budget' => $monthlyBudget,
                'budget_percentage' => floatval($budgetPercentage),
                'recent_transactions' => $recentTransactions,
                'category_expenses' => $categoryExpenses,
                'yearly_trends' => $yearlyTrends,
                'unread_notifications_count' => $user->notifications()->where('is_read', false)->count()
            ];
        });

        return response()->json($data);
    }

    /**
     * Get detailed budget allocations vs actual spending.
     */
    public function budgetVsActual(Request $request)
    {
        $user = $request->user();
        $month = $request->get('month', Carbon::now()->format('Y-m'));
        $parsedMonth = Carbon::parse($month . '-01');

        $categories = ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Other'];

        // Default budgets
        $defaultBudgets = [
            'Food' => 500,
            'Shopping' => 300,
            'Bills' => 400,
            'Travel' => 200,
            'Entertainment' => 150,
            'Other' => 100
        ];

        // Fetch user's set budget
        $budgetRecord = $user->budgets()->where('month', $month)->first();
        $savedCategoryBudgets = $budgetRecord ? $budgetRecord->category_budgets : null;

        $budgetValues = [];
        foreach ($categories as $cat) {
            if ($savedCategoryBudgets && isset($savedCategoryBudgets[$cat])) {
                $budgetValues[] = floatval($savedCategoryBudgets[$cat]);
            } else {
                $budgetValues[] = floatval($defaultBudgets[$cat]);
            }
        }

        // Fetch actual monthly expenses by category
        $monthlyExpenses = $user->transactions()
            ->where('type', 'expense')
            ->whereMonth('transaction_date', $parsedMonth->month)
            ->whereYear('transaction_date', $parsedMonth->year)
            ->get();

        $actualValues = [];
        foreach ($categories as $cat) {
            $actualValues[] = floatval($monthlyExpenses->where('category', $cat)->sum('amount'));
        }

        return response()->json([
            'categories' => $categories,
            'actual' => $actualValues,
            'budget' => $budgetValues
        ]);
    }

    /**
     * Save/Create a monthly and category budget entry.
     */
    public function saveBudget(Request $request)
    {
        $request->validate([
            'month' => 'required|string',
            'total_budget' => 'required|numeric|min:0',
            'category_budgets' => 'nullable|array'
        ]);

        $user = $request->user();
        $month = $request->input('month');

        $budget = Budget::updateOrCreate(
            ['user_id' => $user->id, 'month' => $month],
            [
                'total_budget' => $request->input('total_budget'),
                'category_budgets' => $request->input('category_budgets')
            ]
        );

        // Invalidate dashboard query cache
        Cache::forget("user_{$user->id}_dashboard_{$month}_" . Carbon::parse($month . '-01')->year);

        return response()->json([
            'success' => true,
            'message' => 'Budget stored successfully!',
            'budget' => $budget
        ]);
    }

    /**
     * Fetch monthly statements with breakdown and transaction lines.
     */
    public function monthlyStatement(Request $request)
    {
        $user = $request->user();
        $month = $request->get('month', Carbon::now()->format('Y-m'));
        $parsedMonth = Carbon::parse($month . '-01');

        $transactions = $user->transactions()
            ->whereMonth('transaction_date', $parsedMonth->month)
            ->whereYear('transaction_date', $parsedMonth->year)
            ->orderBy('transaction_date', 'desc')
            ->get();

        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        $categories = ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Other'];
        $categoryBreakdown = [];
        foreach ($categories as $cat) {
            $categoryBreakdown[$cat] = floatval($transactions->where('type', 'expense')->where('category', $cat)->sum('amount'));
        }

        return response()->json([
            'transactions' => $transactions,
            'total_income' => floatval($totalIncome),
            'total_expense' => floatval($totalExpense),
            'net_balance' => floatval($netBalance),
            'category_breakdown' => $categoryBreakdown
        ]);
    }

    /**
     * Download statement as CSV file.
     */
    public function exportCSV(Request $request)
    {
        $user = $request->user();
        $month = $request->get('month', Carbon::now()->format('Y-m'));
        $parsedMonth = Carbon::parse($month . '-01');

        $transactions = $user->transactions()
            ->whereMonth('transaction_date', $parsedMonth->month)
            ->whereYear('transaction_date', $parsedMonth->year)
            ->orderBy('transaction_date', 'asc')
            ->get();

        $response = new StreamedResponse(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM
            fputcsv($handle, ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Category', 'Note']);

            foreach ($transactions as $t) {
                fputcsv($handle, [
                    $t->id,
                    $t->transaction_date,
                    ucfirst($t->type),
                    $t->amount,
                    $t->currency,
                    $t->category,
                    $t->note
                ]);
            }
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="budgetx_statement_' . $month . '.csv"',
        ]);

        return $response;
    }

    /**
     * Download statement as compatible Excel-friendly file.
     */
    public function exportExcel(Request $request)
    {
        $user = $request->user();
        $month = $request->get('month', Carbon::now()->format('Y-m'));
        $parsedMonth = Carbon::parse($month . '-01');

        $transactions = $user->transactions()
            ->whereMonth('transaction_date', $parsedMonth->month)
            ->whereYear('transaction_date', $parsedMonth->year)
            ->orderBy('transaction_date', 'asc')
            ->get();

        $response = new StreamedResponse(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM
            fputcsv($handle, ['Transaction ID', 'Posting Date', 'Flow Type', 'Amount Value', 'Currency', 'Category Class', 'Memo Note']);

            foreach ($transactions as $t) {
                fputcsv($handle, [
                    $t->id,
                    $t->transaction_date,
                    ucfirst($t->type),
                    $t->amount,
                    $t->currency,
                    $t->category,
                    $t->note
                ]);
            }
            fclose($handle);
        }, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="budgetx_statement_' . $month . '.xls"',
        ]);

        return $response;
    }

    /**
     * Download statement as a printable high-fidelity HTML PDF layout.
     */
    public function exportPDF(Request $request)
    {
        $user = $request->user();
        $month = $request->get('month', Carbon::now()->format('Y-m'));
        $parsedMonth = Carbon::parse($month . '-01');

        $transactions = $user->transactions()
            ->whereMonth('transaction_date', $parsedMonth->month)
            ->whereYear('transaction_date', $parsedMonth->year)
            ->orderBy('transaction_date', 'desc')
            ->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expense = $transactions->where('type', 'expense')->sum('amount');
        $balance = $income - $expense;

        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <title>BudgetX Monthly Ledger Statement - ' . $month . '</title>
            <style>
                body { font-family: "Segoe UI", Arial, sans-serif; color: #1e293b; background: #fff; margin: 30px; line-height: 1.5; }
                .container { max-width: 800px; margin: 0 auto; }
                .header-flex { display: table; width: 100%; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
                .logo-col { display: table-cell; vertical-align: top; }
                .logo-col h1 { margin: 0; font-size: 26px; color: #3b82f6; font-weight: bold; }
                .logo-sub { font-size: 12px; color: #64748b; margin-top: 3px; }
                .meta-col { display: table-cell; text-align: right; vertical-align: top; font-size: 13px; color: #475569; }
                .grid-cards { display: table; width: 100%; margin-bottom: 30px; }
                .card { display: table-cell; width: 33.3%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
                .card-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 6px; }
                .card-val { font-size: 20px; font-weight: bold; }
                .card.inc .card-val { color: #10b981; }
                .card.exp .card-val { color: #ef4444; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th { background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; color: #334155; font-weight: 700; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
                td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
                .badge { padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
                .badge.income { background: #dcfce7; color: #15803d; }
                .badge.expense { background: #fee2e2; color: #b91c1c; }
                .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header-flex">
                    <div class="logo-col">
                        <h1>BudgetX Statement</h1>
                        <div class="logo-sub">Smart Personal Finance & Budget Ledger</div>
                    </div>
                    <div class="meta-col">
                        <strong>Period:</strong> ' . $month . '<br>
                        <strong>User:</strong> ' . htmlspecialchars($user->name) . '<br>
                        <strong>Email:</strong> ' . htmlspecialchars($user->email) . '
                    </div>
                </div>

                <div class="grid-cards">
                    <div class="card">
                        <div class="card-lbl">Net Savings</div>
                        <div class="card-val">' . number_format($balance, 2) . ' ' . $user->preferred_currency . '</div>
                    </div>
                    <div class="card inc" style="border-left:0; border-right:0;">
                        <div class="card-lbl">Total Receipts</div>
                        <div class="card-val">+' . number_format($income, 2) . ' ' . $user->preferred_currency . '</div>
                    </div>
                    <div class="card exp">
                        <div class="card-lbl">Total Expenses</div>
                        <div class="card-val">-' . number_format($expense, 2) . ' ' . $user->preferred_currency . '</div>
                    </div>
                </div>

                <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #475569;">Transaction Ledger</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Note</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>';

                    if ($transactions->count() > 0) {
                        foreach ($transactions as $t) {
                            $html .= '
                            <tr>
                                <td>' . $t->transaction_date . '</td>
                                <td><strong>' . htmlspecialchars($t->category) . '</strong></td>
                                <td><span class="badge ' . $t->type . '">' . strtoupper($t->type) . '</span></td>
                                <td>' . htmlspecialchars($t->note ?: '-') . '</td>
                                <td style="text-align: right; font-weight: bold; color: ' . ($t->type === 'income' ? '#10b981' : '#1e293b') . '">
                                    ' . ($t->type === 'income' ? '+' : '-') . number_format($t->amount, 2) . ' ' . $t->currency . '
                                </td>
                            </tr>';
                        }
                    } else {
                        $html .= '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No registered transactions.</td></tr>';
                    }

        $html .= '
                    </tbody>
                </table>

                <div class="footer">
                    BudgetX Statement &copy; ' . Carbon::now()->format('Y') . '. Generated on ' . Carbon::now()->toFormattedDateString() . '
                </div>
            </div>
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>';

        return response($html)->header('Content-Type', 'text/html');
    }
}
