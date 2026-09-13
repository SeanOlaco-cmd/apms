<?php

use App\Http\Controllers\AcademicPeriodController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AuthController;
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
    // Registrar-owned data: enrollment, retention, shiftee/transferee.
    // Registrar submits only — cannot edit/delete once submitted.
    // VPAA can correct/unlock (update) or remove bad entries (destroy).
    // Dean and President see it read-only (Dean scoped to own school
    // is enforced inside the controller, not here).
    // ---------------------------------------------------------------
    foreach ([
        'enrollment' => EnrollmentController::class,
        'retention' => RetentionController::class,
        'shiftee-transferee' => ShifteeTransfereeController::class,
    ] as $uri => $controller) {
        Route::middleware('role:president,dean,vpaa,registrar')->get("/{$uri}", [$controller, 'index']);
        Route::middleware('role:president,dean,vpaa,registrar')->get("/{$uri}/{id}", [$controller, 'show']);
        Route::middleware('role:registrar')->post("/{$uri}", [$controller, 'store']);
        Route::middleware('role:vpaa')->put("/{$uri}/{id}", [$controller, 'update']);
        Route::middleware('role:vpaa')->patch("/{$uri}/{id}", [$controller, 'update']);
        Route::middleware('role:vpaa')->delete("/{$uri}/{id}", [$controller, 'destroy']);
    }

    // ---------------------------------------------------------------
    // Dean-owned data: faculty performance, achievements, board exam
    // results, student performance, employees. Dean submits (scoped
    // to their own school, enforced in the controller). VPAA
    // approves/rejects/corrects (update) or removes (destroy).
    // ---------------------------------------------------------------
    foreach ([
        'faculty-performance' => FacultyPerformanceController::class,
        'achievements' => AchievementController::class,
        'board-exam-results' => BoardExamResultController::class,
        'student-performance' => StudentPerformanceController::class,
        'employees' => EmployeeController::class,
    ] as $uri => $controller) {
        Route::middleware('role:president,dean,vpaa')->get("/{$uri}", [$controller, 'index']);
        Route::middleware('role:president,dean,vpaa')->get("/{$uri}/{id}", [$controller, 'show']);
        Route::middleware('role:dean')->post("/{$uri}", [$controller, 'store']);
        Route::middleware('role:vpaa')->put("/{$uri}/{id}", [$controller, 'update']);
        Route::middleware('role:vpaa')->patch("/{$uri}/{id}", [$controller, 'update']);
        Route::middleware('role:vpaa')->delete("/{$uri}/{id}", [$controller, 'destroy']);
    }

    // ---------------------------------------------------------------
    // VPAA-owned: class monitoring.
    // ---------------------------------------------------------------
    Route::middleware('role:president,vpaa')->get('/class-monitoring', [ClassMonitoringController::class, 'index']);
    Route::middleware('role:president,vpaa')->get('/class-monitoring/{id}', [ClassMonitoringController::class, 'show']);
    Route::middleware('role:vpaa')->post('/class-monitoring', [ClassMonitoringController::class, 'store']);
    Route::middleware('role:vpaa')->put('/class-monitoring/{id}', [ClassMonitoringController::class, 'update']);
    Route::middleware('role:vpaa')->patch('/class-monitoring/{id}', [ClassMonitoringController::class, 'update']);
    Route::middleware('role:vpaa')->delete('/class-monitoring/{id}', [ClassMonitoringController::class, 'destroy']);


    // ---------------------------------------------------------------
    // Backup & Recovery: VPAA only.
    // ---------------------------------------------------------------
    Route::middleware('role:vpaa')->group(function () {
    Route::get('/backups', [\App\Http\Controllers\BackupController::class, 'index']);
    Route::post('/backups', [\App\Http\Controllers\BackupController::class, 'store']);
    Route::get('/backups/{filename}/download', [\App\Http\Controllers\BackupController::class, 'download']);
    Route::post('/backups/{filename}/restore', [\App\Http\Controllers\BackupController::class, 'restore']);
    Route::delete('/backups/{filename}', [\App\Http\Controllers\BackupController::class, 'destroy']);
    });


    // ---------------------------------------------------------------
    // Reference data: schools, programs, academic periods.
    // Everyone can read (dropdowns depend on it); only System Admin
    // can add/edit/remove the underlying reference data.
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
    // User management: System Admin only. VPAA gets read-only
    // visibility for oversight, per the VPAA/System Admin split.
    // ---------------------------------------------------------------
    Route::middleware('role:system_admin,vpaa')->get('/users', [UserController::class, 'index']);
    Route::middleware('role:system_admin,vpaa')->get('/users/{id}', [UserController::class, 'show']);
    Route::middleware('role:system_admin')->post('/users', [UserController::class, 'store']);
    Route::middleware('role:system_admin')->put('/users/{id}', [UserController::class, 'update']);
    Route::middleware('role:system_admin')->patch('/users/{id}', [UserController::class, 'update']);
    Route::middleware('role:system_admin')->delete('/users/{id}', [UserController::class, 'destroy']);
});