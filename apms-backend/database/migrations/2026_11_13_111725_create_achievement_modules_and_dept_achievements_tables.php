<?php

use Illuminate\Support\Facades\DB;
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
        if (! Schema::hasTable('achievement_modules')) {
            Schema::create('achievement_modules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->string('code', 30);
                $table->string('name');
                $table->string('kind', 20)->default('achievement'); // topcit | board_exam | achievement
                $table->text('description')->nullable();
                $table->json('fields')->nullable();
                $table->boolean('is_active')->default(true);
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
                $table->unique(['school_id', 'code']);
            });
        }

        if (! Schema::hasTable('dept_achievements')) {
            Schema::create('dept_achievements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools');
                $table->foreignId('program_id')->nullable()->constrained('programs')->nullOnDelete();
                $table->foreignId('academic_period_id')->constrained('academic_periods');
                $table->foreignId('module_id')->constrained('achievement_modules')->cascadeOnDelete();
                $table->string('recipient_name');
                $table->unsignedTinyInteger('topcit_level')->nullable();
                $table->string('year_level', 20)->nullable();
                $table->string('school_year_attended', 40)->nullable();
                $table->string('exam_name')->nullable();
                $table->string('title')->nullable();
                $table->date('date_awarded')->nullable();
                $table->text('notes')->nullable();
                $table->string('status')->default('pending');
                $table->text('rejection_reason')->nullable();
                $table->foreignId('submitted_by')->constrained('users');
                $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('vpaa_approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('vpaa_approved_at')->nullable();
                $table->timestamps();
                $table->index(['school_id', 'academic_period_id']);
            });
        }

        $this->seedModules();
    }

    // What each school records. A System Admin screen can edit these rows later.
    private function seedModules(): void
    {
        $years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
        $name = ['key' => 'recipient_name', 'label' => 'Name', 'type' => 'text', 'required' => true];
        $range = ['key' => 'school_year_attended', 'label' => 'School Year Attended', 'type' => 'school_year_range', 'required' => true];
        $notes = ['key' => 'notes', 'label' => 'Notes (optional)', 'type' => 'textarea', 'required' => false];
        $general = [
            $name,
            ['key' => 'program_id', 'label' => 'Program', 'type' => 'program', 'required' => false],
            ['key' => 'year_level', 'label' => 'Year Level', 'type' => 'select', 'options' => $years, 'required' => false],
            ['key' => 'title', 'label' => 'Achievement', 'type' => 'text', 'required' => true],
            ['key' => 'date_awarded', 'label' => 'Date', 'type' => 'date', 'required' => false],
            $notes,
        ];

        $modules = [
            'SCS' => [[
                'code' => 'topcit',
                'name' => 'TOPCIT',
                'kind' => 'topcit',
                'description' => 'Manually record a student\'s TOPCIT result.',
                'fields' => [
                    ['key' => 'recipient_name', 'label' => 'Student Name', 'type' => 'text', 'required' => true],
                    ['key' => 'topcit_level', 'label' => 'TOPCIT Level', 'type' => 'select', 'options' => [1, 2, 3, 4, 5], 'required' => true],
                    ['key' => 'program_id', 'label' => 'Program', 'type' => 'program', 'required' => true],
                    ['key' => 'year_level', 'label' => 'Year Level', 'type' => 'select', 'options' => $years, 'required' => true],
                    $notes,
                ],
            ]],
            'SED' => [[
                'code' => 'let',
                'name' => 'LET Passers',
                'kind' => 'board_exam',
                'description' => 'Manually record licensure examination passers.',
                'fields' => [$name, $range, $notes],
            ]],
            'SAS' => [[
                'code' => 'board_exams',
                'name' => 'Board Exams',
                'kind' => 'board_exam',
                'description' => 'Psychology and Social Work licensure examination passers.',
                'fields' => [
                    $name,
                    ['key' => 'exam_name', 'label' => 'Board Exam', 'type' => 'select', 'options' => ['Psychology', 'Social Work'], 'required' => true],
                    $range,
                    $notes,
                ],
            ]],
            'SBM' => [[
                'code' => 'chra',
                'name' => 'CHRA',
                'kind' => 'achievement',
                'description' => 'Manually record a CHRA achievement.',
                'fields' => $general,
            ]],
            'SPES' => [[
                'code' => 'lcuaa',
                'name' => 'LCUAA Achievements',
                'kind' => 'achievement',
                'description' => 'Manually record an LCUAA achievement.',
                'fields' => $general,
            ]],
        ];

        foreach ($modules as $schoolCode => $list) {
            $schoolId = DB::table('schools')->where('code', $schoolCode)->value('id');
            if (! $schoolId) {
                continue;
            }
            foreach ($list as $order => $module) {
                DB::table('achievement_modules')->insertOrIgnore([
                    'school_id' => $schoolId,
                    'code' => $module['code'],
                    'name' => $module['name'],
                    'kind' => $module['kind'],
                    'description' => $module['description'],
                    'fields' => json_encode($module['fields']),
                    'is_active' => true,
                    'sort_order' => $order,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('dept_achievements');
        Schema::dropIfExists('achievement_modules');
    }
};
