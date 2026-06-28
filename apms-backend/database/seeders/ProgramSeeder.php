<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $programs = [
            // SCS - school_id 1
            ['school_id' => 1, 'name' => 'Bachelor of Science in Computer Science', 'code' => 'BSCS', 'max_capacity' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['school_id' => 1, 'name' => 'Bachelor of Science in Information Technology', 'code' => 'BSIT', 'max_capacity' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // SED - school_id 2
            ['school_id' => 2, 'name' => 'Bachelor of Secondary Education Major in English', 'code' => 'BSED-ENG', 'max_capacity' => 80, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['school_id' => 2, 'name' => 'Bachelor of Secondary Education Major in Filipino', 'code' => 'BSED-FIL', 'max_capacity' => 80, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['school_id' => 2, 'name' => 'Bachelor of Secondary Education Major in Mathematics', 'code' => 'BSED-MATH', 'max_capacity' => 80, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['school_id' => 2, 'name' => 'Bachelor of Secondary Education Major in Social Studies', 'code' => 'BSED-SS', 'max_capacity' => 80, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // SHTM - school_id 3
            ['school_id' => 3, 'name' => 'Bachelor of Science in Hospitality Management', 'code' => 'BSHM', 'max_capacity' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['school_id' => 3, 'name' => 'Bachelor of Science in Tourism Management', 'code' => 'BSTM', 'max_capacity' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // SAS - school_id 4
            ['school_id' => 4, 'name' => 'TBD', 'code' => 'TBD', 'max_capacity' => 0, 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],

            // SPES - school_id 5
            ['school_id' => 5, 'name' => 'TBD', 'code' => 'TBD', 'max_capacity' => 0, 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],

            // SBM - school_id 6
            ['school_id' => 6, 'name' => 'Bachelor of Science in Business Administration Major in Marketing Management', 'code' => 'BSBA-MM', 'max_capacity' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['school_id' => 6, 'name' => 'Bachelor of Science in Business Administration Major in Human Resource Development Management', 'code' => 'BSBA-HRDM', 'max_capacity' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['school_id' => 6, 'name' => 'Bachelor of Science in Office Administration', 'code' => 'BSOA', 'max_capacity' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('programs')->insert($programs);
    }
}