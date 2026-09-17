<?php

use App\Http\Controllers\AcademicPeriodController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\BoardExamResultController;
use App\Http\Controllers\ClassMonitoringController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\FacultyPerformanceController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\RetentionController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\ShifteeTransfereeController;
use App\Http\Controllers\StudentPerformanceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Self-service, any authenticated role
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // ---------------------------------------------------------------
    // The 8 categories DH now owns again: enrollment, retention,
    // shiftee/transferee, faculty performance, achievements, board exam
    // results, student performance, employees.
    //
    // Original 3-tier chain, restored:
    //   DH submits (scoped to own school+program) — can edit/resubmit
    //     while status is pending or rejected
    //   Dean approves/rejects (scoped to own school)
    //   VPAA + President see everything, read-only
    // ---------------------------------------------------------------
    foreach ([
        'enrollment' => EnrollmentController::class,
        'retention' => RetentionController::class,
        'shiftee-transferee' => ShifteeTransfereeController::class,
        'faculty-performance' => FacultyPerformanceController::class,
        'achievements' => AchievementController::class,
        'board-exam-results' => BoardExamResultController::class,
        'student-performance' => StudentPerformanceController::class,
        'employees' => EmployeeController::class,
    ] as $uri => $controller) {
        Route::middleware('role:president,dean,vpaa,department_head')->get("/{$uri}", [$controller, 'index']);
        Route::middleware('role:president,dean,vpaa,department_head')->get("/{$uri}/{id}", [$controller, 'show']);
        Route::middleware('role:department_head')->post("/{$uri}", [$controller, 'store']);
        Route::middleware('role:department_head')->put("/{$uri}/{id}", [$controller, 'resubmit']);
        Route::middleware('role:department_head')->patch("/{$uri}/{id}", [$controller, 'resubmit']);
        Route::middleware('role:dean')->put("/{$uri}/{id}/review", [$controller, 'review']);
        Route::middleware('role:dean')->patch("/{$uri}/{id}/review", [$controller, 'review']);
        Route::middleware('role:dean')->delete("/{$uri}/{id}", [$controller, 'destroy']);
    }

    // ---------------------------------------------------------------
    // VPAA-owned: class monitoring, backup & recovery.
    // ---------------------------------------------------------------
    Route::middleware('role:president,vpaa')->get('/class-monitoring', [ClassMonitoringController::class, 'index']);
    Route::middleware('role:president,vpaa')->get('/class-monitoring/{id}', [ClassMonitoringController::class, 'show']);
    Route::middleware('role:vpaa')->post('/class-monitoring', [ClassMonitoringController::class, 'store']);
    Route::middleware('role:vpaa')->put('/class-monitoring/{id}', [ClassMonitoringController::class, 'update']);
    Route::middleware('role:vpaa')->patch('/class-monitoring/{id}', [ClassMonitoringController::class, 'update']);
    Route::middleware('role:vpaa')->delete('/class-monitoring/{id}', [ClassMonitoringController::class, 'destroy']);

    Route::middleware('role:vpaa')->get('/backups', [BackupController::class, 'index']);
    Route::middleware('role:vpaa')->post('/backups', [BackupController::class, 'store']);
    Route::middleware('role:vpaa')->get('/backups/{filename}/download', [BackupController::class, 'download']);
    Route::middleware('role:vpaa')->post('/backups/{filename}/restore', [BackupController::class, 'restore']);
    Route::middleware('role:vpaa')->delete('/backups/{filename}', [BackupController::class, 'destroy']);

    // ---------------------------------------------------------------
    // Reference data: schools, programs, academic periods.
    // Everyone reads; only System Admin writes.
    // ---------------------------------------------------------------
    foreach ([
        'schools' => SchoolController::class,
        'programs' => ProgramController::class,
        'academic-periods' => AcademicPeriodController::class,
    ] as $uri => $controller) {
        Route::get("/{$uri}", [$controller, 'index']);
        Route::get("/{$uri}/{id}", [$controller, 'show']);
        Route::middleware('role:system_admin')->post("/{$uri}", [$controller, 'store']);
        Route::middleware('role:system_admin')->put("/{$uri}/{id}", [$controller, 'update']);
        Route::middleware('role:system_admin')->patch("/{$uri}/{id}", [$controller, 'update']);
        Route::middleware('role:system_admin')->delete("/{$uri}/{id}", [$controller, 'destroy']);
    }

    // ---------------------------------------------------------------
    // User management: System Admin only (writes). VPAA read-only.
    // ---------------------------------------------------------------
    Route::middleware('role:system_admin,vpaa')->get('/users', [UserController::class, 'index']);
    Route::middleware('role:system_admin,vpaa')->get('/users/{id}', [UserController::class, 'show']);
    Route::middleware('role:system_admin')->post('/users', [UserController::class, 'store']);
    Route::middleware('role:system_admin')->put('/users/{id}', [UserController::class, 'update']);
    Route::middleware('role:system_admin')->patch('/users/{id}', [UserController::class, 'update']);
    Route::middleware('role:system_admin')->delete('/users/{id}', [UserController::class, 'destroy']);
});