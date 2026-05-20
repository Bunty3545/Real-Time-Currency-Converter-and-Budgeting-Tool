<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule guest sandboxes cleanup every day
Schedule::command('guests:cleanup')->daily();

// Schedule automated recurring billing cloning at midnight daily
Schedule::command('recurring:process')->dailyAt('00:00');

