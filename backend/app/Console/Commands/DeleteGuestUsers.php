<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Carbon\Carbon;

class DeleteGuestUsers extends Command
{
    protected $signature = 'guests:cleanup';
    protected $description = 'Clean up guest user sandbox accounts that have expired past their 24h lifespan.';

    public function handle()
    {
        $expiredCount = User::where('is_guest', true)
            ->where('guest_expires_at', '<', Carbon::now())
            ->count();

        if ($expiredCount === 0) {
            $this->info('No expired guest accounts detected.');
            return 0;
        }

        // Deleting the user triggers cascading delete for related budgets, transactions, and notifications
        User::where('is_guest', true)
            ->where('guest_expires_at', '<', Carbon::now())
            ->delete();

        $this->info("Successfully pruned {$expiredCount} expired sandbox account logs.");
        return 0;
    }
}
