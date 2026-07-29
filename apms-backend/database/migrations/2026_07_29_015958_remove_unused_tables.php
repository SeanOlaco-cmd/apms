<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('corporate_partnerships');
        Schema::dropIfExists('accreditation_status');
        Schema::dropIfExists('recruitment_data');
        Schema::dropIfExists('workforce_needs');
    }

    public function down(): void
    {
        // Tables removed intentionally, no rollback needed
    }
};