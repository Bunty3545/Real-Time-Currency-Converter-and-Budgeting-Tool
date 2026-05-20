<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->notifications()
                ->orderBy('created_at', 'desc')
                ->take(15)
                ->get()
        );
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json($notification);
    }

    public function markAllRead(Request $request)
    {
        $request->user()->notifications()
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
