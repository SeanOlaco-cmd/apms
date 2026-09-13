<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // College President
        User::create([
            'name' => 'College President',
            'email' => 'president@cct.edu.ph',
            'password' => Hash::make('cct@president2026'),
            'role' => 'president',
            'school_id' => null,
            'program_id' => null,
            'is_active' => true,
        ]);

        // Deans
        $deans = [
            ['name' => 'Dean of SCS', 'email' => 'dean.scs@cct.edu.ph', 'password' => 'cct@scs2026', 'school_id' => 1],
            ['name' => 'Dean of SED', 'email' => 'dean.sed@cct.edu.ph', 'password' => 'cct@sed2026', 'school_id' => 2],
            ['name' => 'Dean of SHTM', 'email' => 'dean.shtm@cct.edu.ph', 'password' => 'cct@shtm2026', 'school_id' => 3],
            ['name' => 'Dean of SAS', 'email' => 'dean.sas@cct.edu.ph', 'password' => 'cct@sas2026', 'school_id' => 4],
            ['name' => 'Dean of SPES', 'email' => 'dean.spes@cct.edu.ph', 'password' => 'cct@spes2026', 'school_id' => 5],
            ['name' => 'Dean of SBM', 'email' => 'dean.sbm@cct.edu.ph', 'password' => 'cct@sbm2026', 'school_id' => 6],
        ];

        foreach ($deans as $dean) {
            User::create([
                'name' => $dean['name'],
                'email' => $dean['email'],
                'password' => Hash::make($dean['password']),
                'role' => 'dean',
                'school_id' => $dean['school_id'],
                'program_id' => null,
                'is_active' => true,
            ]);
        }

        // VPAA
        User::create([
            'name' => 'Vice President Academic Affairs',
            'email' => 'vpaa@cct.edu.ph',
            'password' => Hash::make('cct@vpaa2026'),
            'role' => 'vpaa',
            'school_id' => null,
            'program_id' => null,
            'is_active' => true,
        ]);

        // System Admin
        User::create([
            'name' => 'System Administrator',
            'email' => 'sysadmin@cct.edu.ph',
            'password' => Hash::make('cct@sysadmin2026'),
            'role' => 'system_admin',
            'school_id' => null,
            'program_id' => null,
            'is_active' => true,
        ]);

        // Registrar — college-wide, replaces the old per-program Department Head accounts
        User::create([
            'name' => 'Registrar',
            'email' => 'registrar@cct.edu.ph',
            'password' => Hash::make('registrar@cct_2026'),
            'role' => 'registrar',
            'school_id' => null,
            'program_id' => null,
            'is_active' => true,
        ]);
    }
}