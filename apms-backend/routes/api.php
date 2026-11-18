<?php

use App\Http\Controllers\AcademicPeriodController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\BoardExamResultController;
use App\Http\Controllers\ClassMonitoringController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ClassMonitoringLogController;
use App\Http\Controllers\DeptAchievementController;
use App\Http\Controllers\RetentionRecordController;
use App\Http\Controllers\RetentionReportController;
use App\Http\Controllers\FacultyPerformanceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\RetentionController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\ShifteeTransfereeController;
use App\Http\Controllers\StudentPerformanceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentCaseController;

// Public
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::put('/profile/username', [AuthController::class, 'updateUsername']);
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [AuthController::class, 'removeAvatar']);

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
        // Stage 2 — VPAA reviews what Dean already approved. Approving
        // here is the final step that makes a record visible to the
        // President (status becomes 'approved').
        Route::middleware('role:vpaa')->put("/{$uri}/{{$param}}/vpaa-review", [$controller, 'vpaaReview']);
        Route::middleware('role:vpaa')->patch("/{$uri}/{{$param}}/vpaa-review", [$controller, 'vpaaReview']);
        Route::middleware('role:dean')->delete("/{$uri}/{{$param}}", [$controller, 'destroy']);
    }

    // VPAA-owned: class monitoring, backup & recovery.
    Route::middleware('role:president,vpaa')->get('/class-monitoring', [ClassMonitoringController::class, 'index']);
    Route::middleware('role:president,vpaa')->get('/class-monitoring/{classMonitoring}', [ClassMonitoringController::class, 'show']);
    Route::middleware('role:vpaa')->post('/class-monitoring', [ClassMonitoringController::class, 'store']);
    Route::middleware('role:vpaa')->put('/class-monitoring/{classMonitoring}', [ClassMonitoringController::class, 'update']);
    Route::middleware('role:vpaa')->patch('/class-monitoring/{classMonitoring}', [ClassMonitoringController::class, 'update']);
    Route::middleware('role:vpaa')->delete('/class-monitoring/{classMonitoring}', [ClassMonitoringController::class, 'destroy']);

    // Backup & recovery: System Admin only.
    Route::middleware('role:system_admin')->get('/backups', [BackupController::class, 'index']);
    Route::middleware('role:system_admin')->post('/backups', [BackupController::class, 'store']);
    Route::middleware('role:system_admin')->post('/backups/restore', [BackupController::class, 'restoreUpload']);
    Route::middleware('role:system_admin')->get('/backups/{filename}/download', [BackupController::class, 'download']);
    Route::middleware('role:system_admin')->post('/backups/{filename}/restore', [BackupController::class, 'restore']);
    Route::middleware('role:system_admin')->delete('/backups/{filename}', [BackupController::class, 'destroy']);


    // Student cases (dropout/shift/transfer detail) — Dean of the
    // student's own school and the submitting DH ONLY. Never exposed to
    // vpaa or president; this table holds personal data (birthdate,
    // student no.) under the Data Privacy Act.
    Route::middleware('role:dean,department_head')->get('/student-cases', [StudentCaseController::class, 'index']);
    Route::middleware('role:department_head')->post('/student-cases', [StudentCaseController::class, 'store']);
    // No update route — cases are immutable once logged (see StudentCaseController).
    Route::middleware('role:department_head')->delete('/student-cases/{studentCase}', [StudentCaseController::class, 'destroy']);

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

    // Notifications — every authenticated role can read/manage their own.
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

    // ===================================================================
    // Revision — Oct 2026
    // ===================================================================

    // Faculty employment status: the DEAN records it, the VPAA approves it.
    Route::middleware('role:dean,vpaa,president')->get('/employees', [EmployeeController::class, 'index']);
    Route::middleware('role:dean,vpaa,president')->get('/employees/{employee}', [EmployeeController::class, 'show']);
    Route::middleware('role:dean')->post('/employees', [EmployeeController::class, 'store']);
    Route::middleware('role:dean')->put('/employees/{employee}', [EmployeeController::class, 'resubmit']);
    Route::middleware('role:dean')->patch('/employees/{employee}', [EmployeeController::class, 'resubmit']);
    Route::middleware('role:vpaa')->put('/employees/{employee}/vpaa-review', [EmployeeController::class, 'vpaaReview']);
    Route::middleware('role:vpaa')->patch('/employees/{employee}/vpaa-review', [EmployeeController::class, 'vpaaReview']);
    Route::middleware('role:dean')->delete('/employees/{employee}', [EmployeeController::class, 'destroy']);

    // Retention: student movement records (DH) grouped into one report per program per period.
    Route::middleware('role:department_head,dean,vpaa,president')->get('/retention-records', [RetentionRecordController::class, 'index']);
    Route::middleware('role:department_head')->post('/retention-records', [RetentionRecordController::class, 'store']);
    Route::middleware('role:department_head')->put('/retention-records/{retentionRecord}', [RetentionRecordController::class, 'update']);
    Route::middleware('role:department_head')->patch('/retention-records/{retentionRecord}', [RetentionRecordController::class, 'update']);
    Route::middleware('role:department_head')->delete('/retention-records/{retentionRecord}', [RetentionRecordController::class, 'destroy']);

    Route::middleware('role:department_head,dean,vpaa,president')->get('/retention-reports', [RetentionReportController::class, 'index']);
    Route::middleware('role:department_head,dean,vpaa,president')->get('/retention-reports/{retentionReport}', [RetentionReportController::class, 'show']);
    Route::middleware('role:department_head')->post('/retention-reports', [RetentionReportController::class, 'submit']);
    Route::middleware('role:dean')->put('/retention-reports/{retentionReport}/review', [RetentionReportController::class, 'review']);
    Route::middleware('role:dean')->patch('/retention-reports/{retentionReport}/review', [RetentionReportController::class, 'review']);
    Route::middleware('role:vpaa')->put('/retention-reports/{retentionReport}/vpaa-review', [RetentionReportController::class, 'vpaaReview']);
    Route::middleware('role:vpaa')->patch('/retention-reports/{retentionReport}/vpaa-review', [RetentionReportController::class, 'vpaaReview']);

    // Departmental achievements / board exams: the DEAN records, the VPAA approves.
    Route::middleware('role:dean,vpaa,president,system_admin')->get('/achievement-modules', [DeptAchievementController::class, 'modules']);
    Route::middleware('role:dean,vpaa,president')->get('/dept-achievements', [DeptAchievementController::class, 'index']);
    Route::middleware('role:dean')->post('/dept-achievements', [DeptAchievementController::class, 'store']);
    Route::middleware('role:dean')->put('/dept-achievements/{deptAchievement}', [DeptAchievementController::class, 'resubmit']);
    Route::middleware('role:dean')->patch('/dept-achievements/{deptAchievement}', [DeptAchievementController::class, 'resubmit']);
    Route::middleware('role:vpaa')->put('/dept-achievements/{deptAchievement}/vpaa-review', [DeptAchievementController::class, 'vpaaReview']);
    Route::middleware('role:vpaa')->patch('/dept-achievements/{deptAchievement}/vpaa-review', [DeptAchievementController::class, 'vpaaReview']);
    Route::middleware('role:dean')->delete('/dept-achievements/{deptAchievement}', [DeptAchievementController::class, 'destroy']);

    // Class monitoring (verdict-based): the VPAA enters it, the President can read it.
    Route::middleware('role:vpaa,president')->get('/class-monitoring-logs', [ClassMonitoringLogController::class, 'index']);
    Route::middleware('role:vpaa')->post('/class-monitoring-logs', [ClassMonitoringLogController::class, 'store']);
    Route::middleware('role:vpaa')->put('/class-monitoring-logs/{classMonitoringLog}', [ClassMonitoringLogController::class, 'update']);
    Route::middleware('role:vpaa')->patch('/class-monitoring-logs/{classMonitoringLog}', [ClassMonitoringLogController::class, 'update']);
    Route::middleware('role:vpaa')->delete('/class-monitoring-logs/{classMonitoringLog}', [ClassMonitoringLogController::class, 'destroy']);
});
