<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Newest first. Frontend polls or fetches this on load for the bell icon.
    public function index(Request $request)
    {
        return $request->user()
            ->notifications()
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();
    }

    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => $request->user()->notifications()->whereNull('read_at')->count(),
        ]);
    }

    public function markRead(Request $request, Notification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 403, 'Not your notification.');
        $notification->update(['read_at' => now()]);
        return response()->json($notification);
    }

    public function markAllRead(Request $request)
    {
        $request->user()->notifications()->whereNull('read_at')->update(['read_at' => now()]);
        return response()->json(['message' => 'All marked read.']);
    }
}
