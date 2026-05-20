<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\RecurringController;

class ProcessRecurringTransactions extends Command
{
    protected $signature = 'recurring:process';
    protected $description = 'Process matured recurring transactions and advance next recurring dates.';

    public function handle()
    {
        $this->info('Evaluating mature recurring transactions...');
        
        $controller = new RecurringController();
        $response = $controller->processRecurring();
        $data = $response->getData(true);

        $this->info("Complete! Cloned {$data['processed_count']} recurring instances into active ledger logs.");
        return 0;
    }
}
