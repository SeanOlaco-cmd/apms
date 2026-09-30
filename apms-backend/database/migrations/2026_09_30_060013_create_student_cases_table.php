<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Individual student-level case detail behind the Retention and
// Shiftee/Transferee aggregate numbers — student no., birthdate, year,
// section, and why they dropped out / shifted / transferred. This is
// NOT part of the Dean->VPAA approval chain and has NO status column:
// it's supporting detail, not a reportable statistic, and it carries
// personal data (birthdate, student no.) covered by the Data Privacy
// Act (RA 10173). Only the submitting DH and their own school's Dean
// can see it — VPAA and the President never touch this table.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('submitted_by')->constrained('users')->cascadeOnDelete();

            $table->string('student_no', 30);
            $table->string('student_name');
            $table->string('year_level', 30)->nullable();
            $table->string('section', 30)->nullable();
            $table->date('birthdate')->nullable();

            $table->enum('case_type', ['dropout', 'shift_course', 'transfer_school']);
            $table->string('destination')->nullable(); // new program/school, if shifting or transferring
            $table->text('reason');

            $table->timestamps();

            $table->index(['school_id', 'program_id']);
            $table->index('case_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_cases');
    }
};
