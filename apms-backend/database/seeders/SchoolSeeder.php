<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $schools = [
            [
                'name' => 'School of Computer Studies',
                'code' => 'SCS',
                'dean_name' => 'Dean of SCS',
                'description' => 'Offers programs in Information Technology and Computer Science.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'School of Education',
                'code' => 'SED',
                'dean_name' => 'Dean of SED',
                'description' => 'Offers programs in Teacher Education.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'School of Hospitality and Tourism Management',
                'code' => 'SHTM',
                'dean_name' => 'Dean of SHTM',
                'description' => 'Offers programs in Hospitality and Tourism Management.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'School of Arts and Sciences',
                'code' => 'SAS',
                'dean_name' => 'Dean of SAS',
                'description' => 'Offers programs in Arts and Sciences.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'School of Physical Education and Sports',
                'code' => 'SPES',
                'dean_name' => 'Dean of SPES',
                'description' => 'Offers programs in Physical Education and Sports.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'School of Business Management',
                'code' => 'SBM',
                'dean_name' => 'Dean of SBM',
                'description' => 'Offers programs in Business Management.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('schools')->insert($schools);
    }
}