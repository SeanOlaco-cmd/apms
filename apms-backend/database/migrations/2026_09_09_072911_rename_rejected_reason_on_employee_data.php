<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_data', function (Blueprint $table) {
            $table->renameColumn('rejected_reason', 'rejection_reason');
        });
    }

    public function down(): void
    {
        Schema::table('employee_data', function (Blueprint $table) {
            $table->renameColumn('rejection_reason', 'rejected_reason');
        });
    }
};