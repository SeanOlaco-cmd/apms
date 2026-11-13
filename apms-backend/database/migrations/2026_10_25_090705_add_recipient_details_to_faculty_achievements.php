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
        Schema::table('faculty_achievements', function (Blueprint $table) {
            if (! Schema::hasColumn('faculty_achievements', 'program_id')) {
                $table->foreignId('program_id')->nullable()->after('school_id')
                    ->constrained('programs')->nullOnDelete();
            }
            if (! Schema::hasColumn('faculty_achievements', 'recipient_type')) {
                $table->enum('recipient_type', ['faculty', 'student'])->default('faculty')->after('academic_period_id');
            }
            if (! Schema::hasColumn('faculty_achievements', 'year_level')) {
                $table->string('year_level', 20)->nullable()->after('faculty_name');
            }
            if (! Schema::hasColumn('faculty_achievements', 'section')) {
                $table->string('section', 20)->nullable()->after('year_level');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faculty_achievements', function (Blueprint $table) {
            if (Schema::hasColumn('faculty_achievements', 'program_id')) {
                $table->dropConstrainedForeignId('program_id');
            }
            foreach (['section', 'year_level', 'recipient_type'] as $col) {
                if (Schema::hasColumn('faculty_achievements', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
