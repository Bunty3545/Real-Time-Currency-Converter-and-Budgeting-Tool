<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Carbon\Carbon;

class ExportController extends Controller
{
    public function exportCSV(Request $request, $month)
    {
        $user = $request->user();
        $transactions = $user->transactions()
            ->whereMonth('transaction_date', substr($month, 5, 2))
            ->whereYear('transaction_date', substr($month, 0, 4))
            ->orderBy('transaction_date', 'asc')
            ->get();

        $response = new StreamedResponse(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            
            // Add BOM for Excel UTF-8 support
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Headers
            fputcsv($handle, ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Category', 'Note', 'Is Recurring']);

            foreach ($transactions as $t) {
                fputcsv($handle, [
                    $t->id,
                    $t->transaction_date,
                    ucfirst($t->type),
                    $t->amount,
                    $t->currency,
                    $t->category,
                    $t->note,
                    $t->is_recurring ? 'Yes' : 'No'
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="budgetx_statement_' . $month . '.csv"',
        ]);

        return $response;
    }

    public function exportExcel(Request $request)
    {
        $user = $request->user();
        $query = $user->transactions();

        // Optional filters
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        }
        if ($request->has('category') && $request->category !== '') {
            $query->where('category', $request->category);
        }
        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type);
        }

        $transactions = $query->orderBy('transaction_date', 'asc')->get();

        $response = new StreamedResponse(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            
            // UTF-8 BOM
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Headers
            fputcsv($handle, ['ID', 'Transaction Date', 'Type', 'Amount', 'Currency', 'Category', 'Note', 'Recurring Billing']);

            foreach ($transactions as $t) {
                fputcsv($handle, [
                    $t->id,
                    $t->transaction_date,
                    ucfirst($t->type),
                    $t->amount,
                    $t->currency,
                    $t->category,
                    $t->note,
                    $t->is_recurring ? 'Yes' : 'No'
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="budgetx_ledger_export.xls"',
        ]);

        return $response;
    }

    public function exportPDF(Request $request, $month)
    {
        $user = $request->user();
        $transactions = $user->transactions()
            ->whereMonth('transaction_date', substr($month, 5, 2))
            ->whereYear('transaction_date', substr($month, 0, 4))
            ->orderBy('transaction_date', 'desc')
            ->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expense = $transactions->where('type', 'expense')->sum('amount');
        $balance = $income - $expense;

        // Render beautiful HTML print-optimized statement
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <title>BudgetX Monthly Statement - ' . $month . '</title>
            <style>
                body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; color: #334155; margin: 40px; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
                .brand { font-size: 28px; font-weight: bold; color: #3b82f6; }
                .meta { text-align: right; font-size: 14px; color: #64748b; }
                .summary-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                .card { padding: 15px 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
                .card-title { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 5px; }
                .card-val { font-size: 24px; font-weight: bold; }
                .card.income .card-val { color: #10b981; }
                .card.expense .card-val { color: #ef4444; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: bold; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; }
                td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; display: inline-block; }
                .badge.income { bg-color: #ecfdf5; color: #065f46; }
                .badge.expense { bg-color: #fef2f2; color: #991b1b; }
                .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
                @media print {
                    .no-print { display: none; }
                    body { margin: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
                <button onclick="window.print()" style="background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);">
                    🖨️ Print / Save to PDF
                </button>
            </div>
            
            <div class="header">
                <div>
                    <div class="brand">BudgetX</div>
                    <div style="font-size: 14px; color: #64748b; mt: 5px;">Personal Finance & Budget Ledger</div>
                </div>
                <div class="meta">
                    <strong>Statement Period:</strong> ' . $month . '<br>
                    <strong>Issued To:</strong> ' . htmlspecialchars($user->name) . ' (' . htmlspecialchars($user->email) . ')<br>
                    <strong>Generated:</strong> ' . Carbon::now()->toDayDateTimeString() . '
                </div>
            </div>

            <div class="summary-grid">
                <div class="card">
                    <div class="card-title">Net Balance</div>
                    <div class="card-val">' . number_format($balance, 2) . ' ' . $user->preferred_currency . '</div>
                </div>
                <div class="card income">
                    <div class="card-title">Total Income</div>
                    <div class="card-val">+' . number_format($income, 2) . ' ' . $user->preferred_currency . '</div>
                </div>
                <div class="card expense">
                    <div class="card-title">Total Expense</div>
                    <div class="card-val">-' . number_format($expense, 2) . ' ' . $user->preferred_currency . '</div>
                </div>
            </div>

            <h3 style="margin-bottom: 10px; font-size: 16px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Account Ledger</h3>
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
                            <td><span class="badge ' . $t->type . '">' . ucfirst($t->type) . '</span></td>
                            <td>' . htmlspecialchars($t->note ?: '-') . '</td>
                            <td style="text-align: right; font-weight: bold; color: ' . ($t->type === 'income' ? '#10b981' : '#334155') . '">
                                ' . ($t->type === 'income' ? '+' : '-') . number_format($t->amount, 2) . ' ' . $t->currency . '
                            </td>
                        </tr>';
                    }
                } else {
                    $html .= '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No logged transactions for this month.</td></tr>';
                }

        $html .= '
                </tbody>
            </table>

            <div class="footer">
                BudgetX MVC Ledger Statement. Powered by Laravel & React. &copy; ' . Carbon::now()->format('Y') . ' BudgetX. All Rights Reserved.
            </div>
            
            <script>
                // Auto-open print dialog if print flag is passed
                if (window.location.search.includes("print=true")) {
                    window.onload = function() { window.print(); }
                }
            </script>
        </body>
        </html>';

        return response($html)->header('Content-Type', 'text/html');
    }
}
