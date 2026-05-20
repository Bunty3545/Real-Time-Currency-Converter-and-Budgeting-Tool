<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->budgets()->orderBy('month', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'total_budget' => 'required|numeric|min:0'
        ]);

        // check if budget for month already exists
        $budget = $request->user()->budgets()->where('month', $validated['month'])->first();
        if ($budget) {
            $budget->update(['total_budget' => $validated['total_budget']]);
        } else {
            $budget = $request->user()->budgets()->create($validated);
        }

        return response()->json($budget, 201);
    }

    public function show(Request $request, $month)
    {
        $budget = $request->user()->budgets()->where('month', $month)->first();
        if (!$budget) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($budget);
    }
}
