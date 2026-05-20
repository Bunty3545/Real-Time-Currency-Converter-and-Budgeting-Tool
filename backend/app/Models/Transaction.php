<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'currency',
        'category',
        'note',
        'transaction_date',
        'is_recurring',
        'recurring_period',
        'next_recurring_date',
        'receipt_path'
    ];

    protected $casts = [
        'is_recurring' => 'boolean',
        'next_recurring_date' => 'date'
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
