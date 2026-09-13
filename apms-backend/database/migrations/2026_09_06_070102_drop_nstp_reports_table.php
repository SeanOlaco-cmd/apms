<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * NSTP is a minor subject and out of scope for the system per the
 * updated project limitations. Drops the nstp_reports table.
 *
 * RUN THIS LAST, and only after you've exported/archived any NSTP
 * data you want to keep for the project documentation or defense —
 * this migration does not back anything up for you.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('nstp_reports');
    }

    public function down(): void
    {
        // Not reversible — recreate manually from the original
        // migration if you ever need the table back.
    }
};