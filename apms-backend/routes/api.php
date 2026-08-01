<?php

use App\Http\Controllers\BoardExamResultController;
use App\Http\Controllers\ClassMonitoringController;
use App\Http\Controllers\ShifteeTransfereeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\RetentionController;
use App\Http\Controllers\FacultyPerformanceController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\StudentPerformanceController;
use App\Http\Controllers\AcademicPeriodController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('board-exam-results', BoardExamResultController::class);
    Route::apiResource('class-monitoring', ClassMonitoringController::class);
    Route::apiResource('shiftee-transferee', ShifteeTransfereeController::class);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::apiResource('enrollment', EnrollmentController::class);
    Route::apiResource('retention', RetentionController::class);
    Route::apiResource('faculty-performance', FacultyPerformanceController::class);
    Route::apiResource('achievements', AchievementController::class);
    Route::apiResource('student-performance', StudentPerformanceController::class);
    Route::apiResource('academic-periods', AcademicPeriodController::class);
});