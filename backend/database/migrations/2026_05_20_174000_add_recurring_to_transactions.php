<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->boolean('is_recurring')->default(false);
            $table->enum('recurring_period', ['weekly', 'monthly', 'yearly'])->nullable();
            $table->date('next_recurring_date')->nullable();
            $table->string('receipt_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['is_recurring', 'recurring_period', 'next_recurring_date', 'receipt_path']);
        });
    }
};
