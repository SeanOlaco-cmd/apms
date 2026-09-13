<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: widen the enum first — add registrar, keep everything
        // else (including system_admin, which wasn't in the original docs).
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM(
                'president', 'dean', 'vpaa', 'system_admin',
                'nstp_head', 'department_head', 'registrar'
            ) NOT NULL
        ");

        // Step 2: remap department_head accounts to registrar.
        DB::table('users')
            ->where('role', 'department_head')
            ->update(['role' => 'registrar']);

        // Step 3: nstp_head is removed entirely — delete those accounts.
        DB::table('users')->where('role', 'nstp_head')->delete();

        // Step 4: narrow the enum. system_admin is kept for now — merge
        // into vpaa or drop later once we confirm what it's actually for.
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM('president', 'dean', 'vpaa', 'system_admin', 'registrar') NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM(
                'president', 'dean', 'vpaa', 'system_admin', 'nstp_head', 'department_head'
            ) NOT NULL
        ");

        DB::table('users')
            ->where('role', 'registrar')
            ->update(['role' => 'department_head']);
    }
};