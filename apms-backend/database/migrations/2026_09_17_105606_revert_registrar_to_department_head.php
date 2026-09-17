<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Presidential decree reversal: DH/Program Coordinators return, Registrar
 * is removed entirely. Widen first (keep everything), clear out registrar
 * rows, then narrow to the final 5-role set.
 *
 * NOTE: this migration does NOT try to preserve/remap existing registrar
 * accounts — the plan is to truncate & reseed users fresh afterward
 * (this is a short-lived demo database, not production data), which is
 * far safer than trying to guess which of the 11 old dh.* identities each
 * row should map back to.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Step 1: widen — keep registrar alongside department_head so no
        // existing row is left holding an about-to-be-invalid value.
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM(
                'president', 'dean', 'vpaa', 'system_admin',
                'registrar', 'department_head'
            ) NOT NULL
        ");

        // Step 2: clear every user row — see note above. Schools, programs,
        // and academic periods are untouched.
        DB::table('users')->delete();

        // Step 3: narrow to the final set — registrar is gone for good.
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM(
                'president', 'dean', 'vpaa', 'system_admin', 'department_head'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM(
                'president', 'dean', 'vpaa', 'system_admin',
                'registrar', 'department_head'
            ) NOT NULL
        ");
    }
};