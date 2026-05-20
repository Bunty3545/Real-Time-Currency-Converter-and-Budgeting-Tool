<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>BudgetX Statement</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        .header {
            margin-bottom: 25px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: -0.5px;
        }
        .logo span {
            color: #4f46e5;
        }
        .title {
            text-align: right;
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .meta-text {
            color: #64748b;
            font-size: 10px;
        }
        .summary-container {
            margin-bottom: 30px;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }
        .summary-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
        }
        .summary-card.income {
            border-left: 4px solid #10b981;
        }
        .summary-card.expense {
            border-left: 4px solid #ef4444;
        }
        .summary-card.balance {
            border-left: 4px solid #3b82f6;
        }
        .summary-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .summary-value {
            font-size: 15px;
            font-weight: bold;
            color: #0f172a;
        }
        .summary-value.income-text {
            color: #059669;
        }
        .summary-value.expense-text {
            color: #dc2626;
        }
        .summary-value.balance-text {
            color: #2563eb;
        }
        .table-title {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .transactions-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 8px 10px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .transactions-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .transactions-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .type-badge {
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
        }
        .type-income {
            background-color: #d1fae5;
            color: #065f46;
        }
        .type-expense {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .text-income {
            color: #059669;
            font-weight: bold;
        }
        .text-expense {
            color: #dc2626;
            font-weight: bold;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            color: #94a3b8;
            font-size: 8px;
        }
        .page-number:after {
            content: counter(page);
        }
    </style>
</head>
<body>

    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="logo">Budget<span>X</span></div>
                    <div class="meta-text">Personal Finance & Budget Tracker</div>
                </td>
                <td class="title">
                    Financial Statement
                    <div class="meta-text" style="margin-top: 4px;">Generated on: {{ now()->format('M d, Y h:i A') }}</div>
                    <div class="meta-text">Account Holder: {{ $user->name }} ({{ $user->email }})</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary Statistics Grid -->
    <div class="summary-container">
        <table class="summary-table" style="width: 100%;">
            <tr>
                <td style="width: 33.33%; padding-right: 10px;">
                    <div class="summary-card income">
                        <div class="summary-label">Total Inflow</div>
                        <div class="summary-value income-text">+${{ number_format($totalIncome, 2) }}</div>
                    </div>
                </td>
                <td style="width: 33.33%; padding: 0 5px;">
                    <div class="summary-card expense">
                        <div class="summary-label">Total Outflow</div>
                        <div class="summary-value expense-text">-${{ number_format($totalExpense, 2) }}</div>
                    </div>
                </td>
                <td style="width: 33.33%; padding-left: 10px;">
                    <div class="summary-card balance">
                        <div class="summary-label">Net Balance</div>
                        <div class="summary-value balance-text">${{ number_format($netBalance, 2) }}</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Transactions List -->
    <div class="table-title">Transaction Ledger</div>
    <table class="transactions-table">
        <thead>
            <tr>
                <th style="width: 15%;">Date</th>
                <th style="width: 15%;">Type</th>
                <th style="width: 25%;">Category</th>
                <th style="width: 30%;">Note</th>
                <th style="width: 15%; text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $t)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($t->transaction_date)->format('M d, Y') }}</td>
                    <td>
                        <span class="type-badge {{ $t->type === 'income' ? 'type-income' : 'type-expense' }}">
                            {{ $t->type }}
                        </span>
                    </td>
                    <td style="font-weight: 600;">{{ $t->category }}</td>
                    <td style="color: #64748b;">{{ $t->note ?? '-' }}</td>
                    <td style="text-align: right;" class="{{ $t->type === 'income' ? 'text-income' : 'text-expense' }}">
                        {{ $t->type === 'income' ? '+' : '-' }}${{ number_format($t->amount, 2) }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        © {{ date('Y') }} BudgetX. Confirmed academic software release. Page <span class="page-number"></span>
    </div>

</body>
</html>
