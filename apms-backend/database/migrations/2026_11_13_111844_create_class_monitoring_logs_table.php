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
        if (! Schema::hasTable('class_monitoring_logs')) {
            Schema::create('class_monitoring_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('academic_period_id')->constrained('academic_periods');
                $table->foreignId('school_id')->constrained('schools');
                $table->foreignId('program_id')->constrained('programs');
                $table->string('instructor_name');
                $table->string('subject_code', 30);
                $table->string('section', 20);
                $table->string('verdict', 30);
                $table->unsignedSmallInteger('minutes_early')->nullable();
                $table->date('monitored_on');
                $table->text('remarks')->nullable();
                $table->foreignId('recorded_by')->constrained('users');
                $table->timestamps();
                $table->index(['school_id', 'monitored_on']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('class_monitoring_logs');
    }
};
