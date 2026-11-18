<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Backup & recovery — System Admin only.
 *
 * A backup is one JSON file holding every record the offices enter, plus the
 * reference data those records point to. User accounts are left out on
 * purpose: restoring them would roll passwords back and could lock the
 * System Admin out of their own account.
 */
class BackupController extends Controller
{
    public const TABLES = [
        // reference data
        'schools',
        'programs',
        'academic_periods',
        'achievement_modules',
        // records entered through the system
        'enrollment_data',
        'retention_reports',
        'retention_records',
        'employee_data',
        'dept_achievements',
        'class_monitoring_logs',
    ];

    // Backups kept on the server.
    public function index()
    {
        $backups = collect(Storage::disk('local')->files('backups'))
            ->filter(fn($f) => str_ends_with($f, '.json'))
            ->map(function ($file) {
                $content = json_decode(Storage::disk('local')->get($file), true) ?: [];

                return [
                    'filename' => basename($file),
                    'created_by_name' => $content['created_by_name'] ?? 'Unknown',
                    'created_at' => $content['created_at'] ?? null,
                    'total_rows' => collect($content['tables'] ?? [])->sum(fn($rows) => is_array($rows) ? count($rows) : 0),
                    'size_bytes' => Storage::disk('local')->size($file),
                ];
            })
            ->sortByDesc('created_at')
            ->values();

        return response()->json($backups);
    }

    public function store(Request $request)
    {
        $backup = [
            'app' => 'APMS',
            'version' => 2,
            'created_by' => $request->user()->id,
            'created_by_name' => $request->user()->name,
            'created_at' => now()->toISOString(),
            'tables' => [],
        ];

        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table)) {
                $backup['tables'][$table] = DB::table($table)->get()->toArray();
            }
        }

        $filename = 'backup_' . now()->format('Y-m-d_His') . '.json';
        Storage::disk('local')->put("backups/{$filename}", json_encode($backup));

        return response()->json([
            'message' => 'Backup created.',
            'filename' => $filename,
            'created_at' => $backup['created_at'],
            'total_rows' => collect($backup['tables'])->sum(fn($rows) => count($rows)),
        ], 201);
    }

    public function download(string $filename)
    {
        $path = $this->pathFor($filename);

        return Storage::disk('local')->download($path, $filename, ['Content-Type' => 'application/json']);
    }

    // Restore from a backup that is still on the server.
    public function restore(Request $request, string $filename)
    {
        $request->validate(['confirm' => 'required|accepted']);

        $backup = json_decode(Storage::disk('local')->get($this->pathFor($filename)), true);

        return $this->restoreFrom($backup, $filename);
    }

    // Restore from a file the System Admin uploads (a backup downloaded earlier).
    // The raw body is read on purpose: Laravel's request cleanup would otherwise
    // turn empty strings in the backup into nulls.
    public function restoreUpload(Request $request)
    {
        $payload = json_decode($request->getContent(), true);

        if (! is_array($payload) || ($payload['confirm'] ?? false) !== true) {
            return response()->json(['message' => 'Please confirm the restore first.'], 422);
        }

        return $this->restoreFrom($payload['backup'] ?? null, (string) ($payload['name'] ?? 'uploaded file'));
    }

    public function destroy(string $filename)
    {
        Storage::disk('local')->delete($this->pathFor($filename));

        return response()->json(['message' => 'Backup deleted.']);
    }

    private function restoreFrom($backup, string $source)
    {
        if (! is_array($backup) || ! is_array($backup['tables'] ?? null)) {
            return response()->json(['message' => 'This is not an APMS backup file.'], 422);
        }

        // Only the tables this module manages: a hand-edited file can never
        // reach user accounts or anything else.
        $tables = array_intersect_key($backup['tables'], array_flip(self::TABLES));
        if (empty($tables)) {
            return response()->json(['message' => 'The file has none of the tables this module restores.'], 422);
        }

        $restored = [];
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            DB::transaction(function () use ($tables, &$restored) {
                foreach ($tables as $table => $rows) {
                    if (! Schema::hasTable($table) || ! is_array($rows)) {
                        continue;
                    }

                    // Keep only columns the table has today, so a backup made
                    // before a migration still restores.
                    $columns = array_flip(Schema::getColumnListing($table));
                    $clean = [];
                    foreach ($rows as $row) {
                        if (is_array($row) && ($kept = array_intersect_key($row, $columns))) {
                            $clean[] = $kept;
                        }
                    }

                    // delete() rather than truncate(): truncate would commit
                    // the transaction early, so a failure halfway could not be undone.
                    DB::table($table)->delete();
                    foreach (array_chunk($clean, 500) as $chunk) {
                        DB::table($table)->insert($chunk);
                    }
                    $restored[$table] = count($clean);
                }
            });
        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        return response()->json([
            'message' => 'Restore completed.',
            'restored_from' => $source,
            'backup_created_at' => $backup['created_at'] ?? null,
            'restored_at' => now()->toISOString(),
            'tables' => $restored,
        ]);
    }

    private function pathFor(string $filename): string
    {
        abort_unless(preg_match('/^backup_[\d\-_]+\.json$/', $filename), 422, 'Invalid backup filename.');

        $path = "backups/{$filename}";
        abort_unless(Storage::disk('local')->exists($path), 404, 'Backup not found.');

        return $path;
    }
}
