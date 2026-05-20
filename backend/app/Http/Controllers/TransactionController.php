<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exports\TransactionsExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->transactions();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('month')) {
            $query->whereMonth('transaction_date', substr($request->month, 5, 2))
                  ->whereYear('transaction_date', substr($request->month, 0, 4));
        }

        return response()->json($query->orderBy('transaction_date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'category' => 'required|string',
            'note' => 'nullable|string',
            'transaction_date' => 'required|date'
        ]);

        // Prevent accidental repeated/duplicate transactions in a short window (5 seconds)
        $lastTransaction = $request->user()->transactions()
            ->orderBy('created_at', 'desc')
            ->first();

        if ($lastTransaction && 
            $lastTransaction->type === $validated['type'] &&
            floatval($lastTransaction->amount) === floatval($validated['amount']) &&
            $lastTransaction->category === $validated['category'] &&
            $lastTransaction->transaction_date === $validated['transaction_date'] &&
            $lastTransaction->created_at->gt(now()->subSeconds(5))
        ) {
            return response()->json(['message' => 'Duplicate transaction detected. Please wait a few seconds.'], 422);
        }

        $transaction = $request->user()->transactions()->create($validated);

        // Budget Cap Evaluation Trigger
        if ($validated['type'] === 'expense') {
            $month = substr($validated['transaction_date'], 0, 7);
            \App\Http\Controllers\BudgetAlertController::checkThreshold($request->user(), $month);
        }

        return response()->json($transaction, 201);
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($request->user()->id !== $transaction->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => 'in:income,expense',
            'amount' => 'numeric|min:0',
            'currency' => 'string|size:3',
            'category' => 'string',
            'note' => 'nullable|string',
            'transaction_date' => 'date'
        ]);

        $transaction->update($validated);

        // Budget Cap Evaluation Trigger
        $month = substr($transaction->transaction_date, 0, 7);
        \App\Http\Controllers\BudgetAlertController::checkThreshold($request->user(), $month);

        return response()->json($transaction);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($request->user()->id !== $transaction->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $month = substr($transaction->transaction_date, 0, 7);
        $transaction->delete();

        // Budget Cap Evaluation Trigger
        \App\Http\Controllers\BudgetAlertController::checkThreshold($request->user(), $month);

        return response()->json(null, 204);
    }


    public function summary(Request $request)
    {
        $month = $request->get('month', date('Y-m'));
        
        $transactions = $request->user()->transactions()
            ->whereMonth('transaction_date', substr($month, 5, 2))
            ->whereYear('transaction_date', substr($month, 0, 4))
            ->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expense = $transactions->where('type', 'expense')->sum('amount');
        
        $categoryBreakdown = $transactions->where('type', 'expense')
            ->groupBy('category')
            ->map(fn($group) => $group->sum('amount'));

        return response()->json([
            'total_income' => $income,
            'total_expense' => $expense,
            'balance' => $income - $expense,
            'category_breakdown' => $categoryBreakdown
        ]);
    }

    public function exportCSV(Request $request)
    {
        $transactions = $request->user()->transactions()->orderBy('transaction_date', 'desc')->get();
        if ($transactions->isEmpty()) {
            return response()->json(['message' => 'No transactions found to export.'], 404);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transactions_export_' . now()->format('Ymd') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($transactions) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Date', 'Type', 'Category', 'Amount', 'Currency', 'Note']);

            foreach ($transactions as $t) {
                fputcsv($file, [
                    $t->id,
                    $t->transaction_date,
                    $t->type,
                    $t->category,
                    $t->amount,
                    $t->currency,
                    $t->note ?? ''
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        $transactions = $request->user()->transactions()->orderBy('transaction_date', 'desc')->get();
        if ($transactions->isEmpty()) {
            return response()->json(['message' => 'No transactions found to export.'], 404);
        }

        return Excel::download(
            new TransactionsExport($transactions), 
            'transactions_export_' . now()->format('Ymd') . '.xlsx'
        );
    }

    public function exportPDF(Request $request)
    {
        $user = $request->user();
        $transactions = $user->transactions()->orderBy('transaction_date', 'desc')->get();
        if ($transactions->isEmpty()) {
            return response()->json(['message' => 'No transactions found to export.'], 404);
        }

        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        $pdf = Pdf::loadView('exports.transactions_pdf', [
            'user' => $user,
            'transactions' => $transactions,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'netBalance' => $netBalance
        ]);

        return $pdf->download('transactions_export_' . now()->format('Ymd') . '.pdf');
    }
}

