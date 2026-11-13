<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 2-7 chars, letters/numbers/underscore — validated in the
            // controllers. Nullable because existing seeded accounts
            // don't have one yet; they can still log in with email.
            $table->string('username', 20)->nullable()->unique()->after('email');
            $table->string('avatar_path')->nullable()->after('username');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn(['username', 'avatar_path']);
        });
    }
};
