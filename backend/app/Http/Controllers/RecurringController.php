<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RecurringController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->transactions()
                ->where('is_recurring', true)
                ->orderBy('next_recurring_date', 'asc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'category' => 'required|string',
            'recurring_period' => 'required|in:weekly,monthly,yearly',
            'transaction_date' => 'required|date',
            'note' => 'nullable|string'
        ]);

        $date = Carbon::parse($validated['transaction_date']);
        $nextDate = $this->calculateNextDate($date, $validated['recurring_period']);

        $transaction = $request->user()->transactions()->create([
            'type' => 'expense',
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'category' => $validated['category'],
            'note' => $validated['note'] ? "[Recurring Rules] " . $validated['note'] : "[Recurring Rules]",
            'transaction_date' => $validated['transaction_date'],
            'is_recurring' => true,
            'recurring_period' => $validated['recurring_period'],
            'next_recurring_date' => $nextDate
        ]);

        return response()->json($transaction, 201);
    }

    public function destroy(Request $request, $id)
    {
        $transaction = $request->user()->transactions()
            ->where('is_recurring', true)
            ->find($id);

        if (!$transaction) {
            return response()->json(['message' => 'Recurring transaction not found'], 404);
        }

        // Cancel recurring by deleting or turning off
        $transaction->delete();

        return response()->json(['message' => 'Recurring rule canceled successfully.']);
    }

    /**
     * Run daily to process upcoming transactions.
     * Accessible by scheduler commands or webhooks.
     */
    public function processRecurring()
    {
        $today = Carbon::today()->toDateString();
        
        // Find recurring templates that are due to trigger
        $maturedRules = Transaction::where('is_recurring', true)
            ->where('next_recurring_date', '<=', $today)
            ->get();

        $count = 0;
        foreach ($maturedRules as $rule) {
            // 1. Create the new cloned transaction representing the payment instance
            $rule->user->transactions()->create([
                'type' => $rule->type,
                'amount' => $rule->amount,
                'currency' => $rule->currency,
                'category' => $rule->category,
                'note' => "[Recurring Automated] " . str_replace('[Recurring Rules] ', '', $rule->note),
                'transaction_date' => $rule->next_recurring_date
            ]);

            // 2. Schedule the next transaction occurrence date
            $nextDate = $this->calculateNextDate(Carbon::parse($rule->next_recurring_date), $rule->recurring_period);
            
            $rule->update([
                'next_recurring_date' => $nextDate
            ]);

            // 3. Log a user notification about the automatic transaction
            $rule->user->notifications()->create([
                'message' => "🔄 Recurring payment of " . number_format($rule->amount, 2) . " {$rule->currency} for {$rule->category} was processed automatically."
            ]);

            $count++;
        }

        return response()->json([
            'status' => 'success',
            'processed_count' => $count
        ]);
    }

    private function calculateNextDate(Carbon $date, $period)
    {
        switch ($period) {
            case 'weekly':
                return $date->addWeek()->toDateString();
            case 'yearly':
                return $date->addYear()->toDateString();
            case 'monthly':
            default:
                return $date->addMonth()->toDateString();
        }
    }
}
