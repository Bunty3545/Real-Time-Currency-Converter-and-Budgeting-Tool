<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ExchangeRateController extends Controller
{
    public function index()
    {
        $rates = Cache::remember('exchange_rates', 86400, function () {
            return ExchangeRate::all();
        });
        return response()->json($rates);
    }

    public function sync()
    {
        // Use a free public API for exchange rates
        $response = Http::get('https://open.er-api.com/v6/latest/USD');
        
        if ($response->successful()) {
            $rates = $response->json()['rates'];
            
            foreach ($rates as $currency => $rate) {
                ExchangeRate::updateOrCreate(
                    ['base_currency' => 'USD', 'target_currency' => $currency],
                    ['exchange_rate' => $rate]
                );
            }

            Cache::forget('exchange_rates');
            
            return response()->json(['message' => 'Rates synchronized successfully']);
        }
        
        return response()->json(['message' => 'Failed to fetch rates'], 500);
    }
}
