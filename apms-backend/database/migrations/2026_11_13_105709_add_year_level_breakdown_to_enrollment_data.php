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
        Schema::table('enrollment_data', function (Blueprint $table) {
            foreach ([1, 2, 3, 4] as $year) {
                foreach (['new', 'old'] as $kind) {
                    $column = "y{$year}_{$kind}";
                    if (! Schema::hasColumn('enrollment_data', $column)) {
                        $table->unsignedInteger($column)->default(0);
                    }
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('enrollment_data', function (Blueprint $table) {
            foreach ([1, 2, 3, 4] as $year) {
                foreach (['new', 'old'] as $kind) {
                    $column = "y{$year}_{$kind}";
                    if (Schema::hasColumn('enrollment_data', $column)) {
                        $table->dropColumn($column);
                    }
                }
            }
        });
    }
};
