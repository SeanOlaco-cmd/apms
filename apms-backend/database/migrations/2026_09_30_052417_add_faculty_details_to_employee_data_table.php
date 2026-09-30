<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_data', function (Blueprint $table) {
            if (! Schema::hasColumn('employee_data', 'employee_no')) {
                $table->string('employee_no', 30)->nullable()->after('employee_name');
            }
            if (! Schema::hasColumn('employee_data', 'date_hired')) {
                $table->date('date_hired')->nullable()->after('employment_type');
            }
            if (! Schema::hasColumn('employee_data', 'highest_education')) {
                $table->string('highest_education', 100)->nullable()->after('date_hired');
            }
        });
    }

    public function down(): void
    {
        Schema::table('employee_data', function (Blueprint $table) {
            $cols = array_filter(
                ['employee_no', 'date_hired', 'highest_education'],
                fn($c) => Schema::hasColumn('employee_data', $c)
            );
            if ($cols) {
                $table->dropColumn($cols);
            }
        });
    }
};
