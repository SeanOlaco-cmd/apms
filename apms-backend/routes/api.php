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

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // ---------------------------------------------------------------
    // The 8 DH-owned categories.
    //
    // IMPORTANT: the route parameter name MUST match the variable name
    // in the controller method signature (e.g. {enrollment} ->
    // review(Request $request, EnrollmentData $enrollment)). Laravel's
    // implicit route-model binding matches on NAME, not type — a
    // generic {id} silently injects a blank/wrong model, which is what
    // made every Dean approval fail. This is the fix.
    // ---------------------------------------------------------------
    foreach (
        [
            'enrollment' => ['controller' => EnrollmentController::class, 'param' => 'enrollment'],
            'retention' => ['controller' => RetentionController::class, 'param' => 'retention'],
            'shiftee-transferee' => ['controller' => ShifteeTransfereeController::class, 'param' => 'shifteeTransfereeData'],
            'faculty-performance' => ['controller' => FacultyPerformanceController::class, 'param' => 'facultyPerformance'],
            'achievements' => ['controller' => AchievementController::class, 'param' => 'achievement'],
            'board-exam-results' => ['controller' => BoardExamResultController::class, 'param' => 'boardExamResult'],
            'student-performance' => ['controller' => StudentPerformanceController::class, 'param' => 'studentPerformance'],
            'employees' => ['controller' => EmployeeController::class, 'param' => 'employee'],
        ] as $uri => $config
    ) {
        $controller = $config['controller'];
        $param = $config['param'];

        Route::middleware('role:president,dean,vpaa,department_head')->get("/{$uri}", [$controller, 'index']);
        Route::middleware('role:president,dean,vpaa,department_head')->get("/{$uri}/{{$param}}", [$controller, 'show']);
        Route::middleware('role:department_head')->post("/{$uri}", [$controller, 'store']);
        Route::middleware('role:department_head')->put("/{$uri}/{{$param}}", [$controller, 'resubmit']);
        Route::middleware('role:department_head')->patch("/{$uri}/{{$param}}", [$controller, 'resubmit']);
        Route::middleware('role:dean')->put("/{$uri}/{{$param}}/review", [$controller, 'review']);
        Route::middleware('role:dean')->patch("/{$uri}/{{$param}}/review", [$controller, 'review']);
        Route::middleware('role:dean')->delete("/{$uri}/{{$param}}", [$controller, 'destroy']);
    }

    // VPAA-owned: class monitoring, backup & recovery.
    Route::middleware('role:president,vpaa')->get('/class-monitoring', [ClassMonitoringController::class, 'index']);
    Route::middleware('role:president,vpaa')->get('/class-monitoring/{classMonitoring}', [ClassMonitoringController::class, 'show']);
    Route::middleware('role:vpaa')->post('/class-monitoring', [ClassMonitoringController::class, 'store']);
    Route::middleware('role:vpaa')->put('/class-monitoring/{classMonitoring}', [ClassMonitoringController::class, 'update']);
    Route::middleware('role:vpaa')->patch('/class-monitoring/{classMonitoring}', [ClassMonitoringController::class, 'update']);
    Route::middleware('role:vpaa')->delete('/class-monitoring/{classMonitoring}', [ClassMonitoringController::class, 'destroy']);

    Route::middleware('role:vpaa')->get('/backups', [BackupController::class, 'index']);
    Route::middleware('role:vpaa')->post('/backups', [BackupController::class, 'store']);
    Route::middleware('role:vpaa')->get('/backups/{filename}/download', [BackupController::class, 'download']);
    Route::middleware('role:vpaa')->post('/backups/{filename}/restore', [BackupController::class, 'restore']);
    Route::middleware('role:vpaa')->delete('/backups/{filename}', [BackupController::class, 'destroy']);

    // Academic periods: everyone reads. System Admin maintains them —
    // per the Dean's instruction at your defense, NOT VPAA.
    Route::get('/academic-periods', [AcademicPeriodController::class, 'index']);
    Route::get('/academic-periods/{academicPeriod}', [AcademicPeriodController::class, 'show']);
    Route::middleware('role:system_admin')->post('/academic-periods', [AcademicPeriodController::class, 'store']);
    Route::middleware('role:system_admin')->put('/academic-periods/{academicPeriod}', [AcademicPeriodController::class, 'update']);
    Route::middleware('role:system_admin')->patch('/academic-periods/{academicPeriod}', [AcademicPeriodController::class, 'update']);
    Route::middleware('role:system_admin')->delete('/academic-periods/{academicPeriod}', [AcademicPeriodController::class, 'destroy']);

    // Reference data: schools, programs. Everyone reads; System Admin writes.
    foreach (
        [
            'schools' => ['controller' => SchoolController::class, 'param' => 'school'],
            'programs' => ['controller' => ProgramController::class, 'param' => 'program'],
        ] as $uri => $config
    ) {
        $controller = $config['controller'];
        $param = $config['param'];

        Route::get("/{$uri}", [$controller, 'index']);
        Route::get("/{$uri}/{{$param}}", [$controller, 'show']);
        Route::middleware('role:system_admin')->post("/{$uri}", [$controller, 'store']);
        Route::middleware('role:system_admin')->put("/{$uri}/{{$param}}", [$controller, 'update']);
        Route::middleware('role:system_admin')->patch("/{$uri}/{{$param}}", [$controller, 'update']);
        Route::middleware('role:system_admin')->delete("/{$uri}/{{$param}}", [$controller, 'destroy']);
    }

    // User management: System Admin only (writes, password EXCLUDED). VPAA read-only.
    Route::middleware('role:system_admin,vpaa')->get('/users', [UserController::class, 'index']);
    Route::middleware('role:system_admin,vpaa')->get('/users/{user}', [UserController::class, 'show']);
    Route::middleware('role:system_admin')->post('/users', [UserController::class, 'store']);
    Route::middleware('role:system_admin')->put('/users/{user}', [UserController::class, 'update']);
    Route::middleware('role:system_admin')->patch('/users/{user}', [UserController::class, 'update']);
    Route::middleware('role:system_admin')->delete('/users/{user}', [UserController::class, 'destroy']);
});
