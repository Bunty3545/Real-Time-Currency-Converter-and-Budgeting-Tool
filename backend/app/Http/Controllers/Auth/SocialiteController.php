<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Cache;

class SocialiteController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google response, find/create user, generate token, redirect to React SPA.
     */
    public function handleGoogleCallback()
    {
        return $this->handleSocialCallback('google');
    }

    /**
     * Redirect to GitHub OAuth.
     */
    public function redirectToGithub()
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * Handle GitHub response, find/create user, generate token, redirect to React SPA.
     */
    public function handleGithubCallback()
    {
        return $this->handleSocialCallback('github');
    }

    /**
     * Core handler logic for both Google and GitHub callbacks.
     */
    protected function handleSocialCallback(string $provider)
    {
        try {
            // Retrieve stateless OAuth user profile
            $socialUser = Socialite::driver($provider)->stateless()->user();

            if (!$socialUser || !$socialUser->getEmail()) {
                return redirect('http://localhost:5173/login?error=no_email_provided');
            }

            // 1. Search for existing provider record
            $user = User::where('provider_id', $socialUser->getId())
                        ->where('provider_name', $provider)
                        ->first();

            if (!$user) {
                // 2. Search for existing email to merge accounts
                $user = User::where('email', $socialUser->getEmail())->first();

                if ($user) {
                    // Update user with OAuth details
                    $user->update([
                        'provider_id' => $socialUser->getId(),
                        'provider_name' => $provider,
                        'avatar' => $socialUser->getAvatar(),
                    ]);
                } else {
                    // 3. Create a brand new user
                    $user = User::create([
                        'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Social User',
                        'email' => $socialUser->getEmail(),
                        'provider_id' => $socialUser->getId(),
                        'provider_name' => $provider,
                        'avatar' => $socialUser->getAvatar(),
                        'preferred_currency' => 'USD',
                        'is_guest' => false,
                    ]);
                }
            } else {
                // Update active avatar if changed
                $user->update([
                    'avatar' => $socialUser->getAvatar(),
                ]);
            }

            // Revoke user profile cache to ensure update is visible immediately
            Cache::forget("user_profile_{$user->id}");

            // Generate regular API auth token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect back to frontend OAuthCallback page
            $nameEncoded = urlencode($user->name);
            $emailEncoded = urlencode($user->email);
            $avatarEncoded = urlencode($user->avatar ?? '');

            return redirect("http://localhost:5173/auth/callback?token={$token}&name={$nameEncoded}&email={$emailEncoded}&avatar={$avatarEncoded}&provider={$provider}");

        } catch (Exception $e) {
            logger()->error("Socialite Login Error [{$provider}]: " . $e->getMessage());
            return redirect('http://localhost:5173/login?error=auth_denied');
        }
    }
}
