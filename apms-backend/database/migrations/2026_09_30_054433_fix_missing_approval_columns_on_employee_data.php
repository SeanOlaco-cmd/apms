<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_data', function (Blueprint $table) {
            if (! Schema::hasColumn('employee_data', 'status')) {
                $table->string('status')->default('pending')->after('employment_type');
            }
            if (! Schema::hasColumn('employee_data', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('status');
            }
            if (! Schema::hasColumn('employee_data', 'submitted_by')) {
                $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('employee_data', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('employee_data', 'approved_at')) {
                $table->timestamp('approved_at')->nullable();
            }
            if (! Schema::hasColumn('employee_data', 'rejected_by')) {
                $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('employee_data', 'vpaa_approved_by')) {
                $table->foreignId('vpaa_approved_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('employee_data', 'vpaa_approved_at')) {
                $table->timestamp('vpaa_approved_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Intentionally empty — this migration only fills in gaps left by
        // earlier migrations. Rolling it back could drop columns other
        // migrations also expect to exist.
    }
};
