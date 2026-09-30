<?php

namespace App\Http\Controllers;

use App\Models\Notification;

abstract class Controller
{
    /**
     * Shared helper so every controller can fire a notification without
     * repeating the Notification::create(...) boilerplate. $data is
     * whatever the frontend needs to deep-link the notification (e.g.
     * ['category' => 'enrollment', 'record_id' => 5]).
     */
    protected function notify(?int $userId, string $title, string $message, array $data = []): void
    {
        if (! $userId) {
            return; // e.g. submitted_by was null, or no Dean recorded yet — nothing to notify
        }

        Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }
}
