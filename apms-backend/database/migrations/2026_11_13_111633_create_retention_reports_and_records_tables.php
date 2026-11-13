<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('retention_reports')) {
            Schema::create('retention_reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools');
                $table->foreignId('program_id')->constrained('programs');
                $table->foreignId('academic_period_id')->constrained('academic_periods');
                $table->foreignId('submitted_by')->constrained('users');
                $table->string('status')->default('pending');
                $table->text('rejection_reason')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approved_at')->nullable();
                $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('vpaa_approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('vpaa_approved_at')->nullable();
                $table->timestamps();
                $table->unique(['program_id', 'academic_period_id']);
            });
        }

        if (! Schema::hasTable('retention_records')) {
            Schema::create('retention_records', function (Blueprint $table) {
                $table->id();
                $table->foreignId('retention_report_id')->nullable()->constrained('retention_reports')->nullOnDelete();
                $table->foreignId('school_id')->constrained('schools');
                $table->foreignId('program_id')->constrained('programs');
                $table->foreignId('academic_period_id')->constrained('academic_periods');
                $table->string('student_no', 30);
                $table->string('student_name');
                $table->string('type', 20);
                $table->string('reason');
                $table->date('record_date');
                $table->text('notes')->nullable();
                $table->foreignId('recorded_by')->constrained('users');
                $table->timestamps();
                $table->index(['program_id', 'academic_period_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('retention_records');
        Schema::dropIfExists('retention_reports');
    }
};
