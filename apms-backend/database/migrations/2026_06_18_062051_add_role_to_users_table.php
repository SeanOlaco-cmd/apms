<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'president',
                'dean',
                'officer'
            ])->default('officer')->after('email');
            $table->foreignId('school_id')->nullable()->constrained()->onDelete('set null')->after('role');
            $table->boolean('is_active')->default(true)->after('school_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'school_id', 'is_active']);
        });
    }
};