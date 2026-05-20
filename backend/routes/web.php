<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SocialiteController;

Route::get('/', function () {
    return view('welcome');
});

// Google OAuth
Route::get('/auth/google/redirect', [SocialiteController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialiteController::class, 'handleGoogleCallback']);

// GitHub OAuth
Route::get('/auth/github/redirect', [SocialiteController::class, 'redirectToGithub']);
Route::get('/auth/github/callback', [SocialiteController::class, 'handleGithubCallback']);
