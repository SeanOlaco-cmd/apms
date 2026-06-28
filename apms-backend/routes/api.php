<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\RecruitmentController;
use App\Http\Controllers\RetentionController;
use App\Http\Controllers\FacultyPerformanceController;
use App\Http\Controllers\WorkforceController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AccreditationController;
use App\Http\Controllers\PartnershipController;
use App\Http\Controllers\StudentPerformanceController;
use App\Http\Controllers\AcademicPeriodController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    Route::apiResource('enrollment', EnrollmentController::class);
    Route::apiResource('recruitment', RecruitmentController::class);
    Route::apiResource('retention', RetentionController::class);
    Route::apiResource('faculty-performance', FacultyPerformanceController::class);
    Route::apiResource('workforce', WorkforceController::class);
    Route::apiResource('achievements', AchievementController::class);
    Route::apiResource('accreditation', AccreditationController::class);
    Route::apiResource('partnerships', PartnershipController::class);
    Route::apiResource('student-performance', StudentPerformanceController::class);
    Route::apiResource('academic-periods', AcademicPeriodController::class);
});