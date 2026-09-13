<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    // These are the tables that "pass through VPAA" — Registrar's
    // college-wide data plus everything Dean submits and VPAA approves.
    protected array $tables = [
        'enrollment_data',
        'retention_rates',
        'shiftee_transferee_data',
        'faculty_performance',
        'faculty_achievements',
        'board_exam_results',
        'student_performance',
        'employee_data',
        'class_monitoring',
    ];

    public function index()
    {
        $files = Storage::disk('local')->files('backups');

        $backups = collect($files)
            ->filter(fn($f) => str_ends_with($f, '.json'))
            ->map(function ($file) {
                $content = json_decode(Storage::disk('local')->get($file), true);
                $rowCount = collect($content['tables'] ?? [])->sum(fn($rows) => count($rows));

                return [
                    'filename' => basename($file),
                    'created_by_name' => $content['created_by_name'] ?? 'Unknown',
                    'created_at' => $content['created_at'] ?? null,
                    'total_rows' => $rowCount,
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
            'created_by' => $request->user()->id,
            'created_by_name' => $request->user()->name,
            'created_at' => now()->toISOString(),
            'tables' => [],
        ];

        foreach ($this->tables as $table) {
            $backup['tables'][$table] = DB::table($table)->get()->toArray();
        }

        $filename = 'backup_' . now()->format('Y-m-d_His') . '.json';
        Storage::disk('local')->put("backups/{$filename}", json_encode($backup, JSON_PRETTY_PRINT));

        return response()->json([
            'message' => 'Backup created successfully',
            'filename' => $filename,
            'created_at' => $backup['created_at'],
        ], 201);
    }

    public function download(string $filename)
    {
        $this->validateFilename($filename);

        $path = "backups/{$filename}";
        if (! Storage::disk('local')->exists($path)) {
            return response()->json(['message' => 'Backup not found'], 404);
        }

        return Storage::disk('local')->download($path);
    }

    public function restore(Request $request, string $filename)
    {
        $this->validateFilename($filename);

        $request->validate(['confirm' => 'required|accepted']);

        $path = "backups/{$filename}";
        if (! Storage::disk('local')->exists($path)) {
            return response()->json(['message' => 'Backup not found'], 404);
        }

        $backup = json_decode(Storage::disk('local')->get($path), true);

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::transaction(function () use ($backup) {
            foreach ($backup['tables'] as $table => $rows) {
                DB::table($table)->truncate();
                foreach (array_chunk($rows, 500) as $chunk) {
                    if (! empty($chunk)) {
                        DB::table($table)->insert($chunk);
                    }
                }
            }
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        return response()->json([
            'message' => 'Restore completed successfully',
            'restored_from' => $filename,
            'restored_at' => now()->toISOString(),
        ]);
    }

    public function destroy(string $filename)
    {
        $this->validateFilename($filename);

        $path = "backups/{$filename}";
        if (! Storage::disk('local')->exists($path)) {
            return response()->json(['message' => 'Backup not found'], 404);
        }

        Storage::disk('local')->delete($path);
        return response()->json(['message' => 'Backup deleted']);
    }

    private function validateFilename(string $filename): void
    {
        abort_unless(preg_match('/^backup_[\d\-_]+\.json$/', $filename), 422, 'Invalid backup filename.');
    }
}