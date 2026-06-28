<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicPeriodSeeder extends Seeder
{
    public function run(): void
    {
        $periods = [
            ['school_year' => '2023-2024', 'semester' => '1st', 'start_date' => '2023-08-01', 'end_date' => '2023-12-31', 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],
            ['school_year' => '2023-2024', 'semester' => '2nd', 'start_date' => '2024-01-01', 'end_date' => '2024-05-31', 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],
            ['school_year' => '2024-2025', 'semester' => '1st', 'start_date' => '2024-08-01', 'end_date' => '2024-12-31', 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],
            ['school_year' => '2024-2025', 'semester' => '2nd', 'start_date' => '2025-01-01', 'end_date' => '2025-05-31', 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],
            ['school_year' => '2025-2026', 'semester' => '1st', 'start_date' => '2025-08-01', 'end_date' => '2025-12-31', 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],
            ['school_year' => '2025-2026', 'semester' => '2nd', 'start_date' => '2026-01-01', 'end_date' => '2026-05-31', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('academic_periods')->insert($periods);
    }
}