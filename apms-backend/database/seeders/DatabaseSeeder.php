<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SchoolSeeder::class,
            ProgramSeeder::class,
            AcademicPeriodSeeder::class,
            UserSeeder::class,
        ]);
    }
}