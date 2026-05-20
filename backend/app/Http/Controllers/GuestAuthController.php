<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GuestAuthController extends Controller
{
    public function guestLogin()
    {
        // 1. Create a temporary guest user account
        $randomId = Str::random(6);
        $email = "guest_" . $randomId . "@budgetx.demo";
        $password = Str::random(12);

        $user = User::create([
            'name' => 'Guest User ' . $randomId,
            'email' => $email,
            'password' => Hash::make($password),
            'preferred_currency' => 'USD',
            'is_guest' => true,
            'guest_expires_at' => Carbon::now()->addDay()
        ]);

        // 2. Generate realistic mock logs so their demo experience is populated instantly
        $month = Carbon::now()->format('Y-m');
        $today = Carbon::now()->toDateString();
        $yesterday = Carbon::now()->subDay()->toDateString();
        $threeDaysAgo = Carbon::now()->subDays(3)->toDateString();

        // Set target monthly budget limit (500.00 USD)
        $user->budgets()->create([
            'month' => $month,
            'total_budget' => 500.00
        ]);

        // Populate a series of pre-configured incomes & expenses
        $user->transactions()->create([
            'type' => 'income',
            'amount' => 1800.00,
            'currency' => 'USD',
            'category' => 'Salary',
            'note' => 'Weekly Paycheck Deposit',
            'transaction_date' => $today
        ]);

        $user->transactions()->create([
            'type' => 'expense',
            'amount' => 110.00,
            'currency' => 'USD',
            'category' => 'Shopping',
            'note' => 'Instore clothing purchase',
            'transaction_date' => $today
        ]);

        $user->transactions()->create([
            'type' => 'expense',
            'amount' => 45.00,
            'currency' => 'USD',
            'category' => 'Food',
            'note' => 'Italian Pizza Delivery',
            'transaction_date' => $yesterday
        ]);

        $user->transactions()->create([
            'type' => 'expense',
            'amount' => 95.00,
            'currency' => 'USD',
            'category' => 'Bills',
            'note' => 'Monthly Wi-Fi statement',
            'transaction_date' => $threeDaysAgo
        ]);

        // 3. Welcome system notification
        $user->notifications()->create([
            'message' => "Welcome to BudgetX Sandbox! Your guest session is active for 24 hours. Preloaded demo logs are ready for testing; feel free to add, export, or scan receipts."
        ]);

        // 4. Issue standard API authentication token
        $token = $user->createToken('guest-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }
}
