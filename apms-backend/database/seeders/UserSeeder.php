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

        // Department Heads
        $deptHeads = [
            // SCS
            ['name' => 'DH - BSCS', 'email' => 'dh.bscs@cct.edu.ph', 'password' => 'cct@bscs2026', 'school_id' => 1, 'program_id' => 1],
            ['name' => 'DH - BSIT', 'email' => 'dh.bsit@cct.edu.ph', 'password' => 'cct@bsit2026', 'school_id' => 1, 'program_id' => 2],

            // SED
            ['name' => 'DH - BSED English', 'email' => 'dh.bsed.eng@cct.edu.ph', 'password' => 'cct@bsedeng2026', 'school_id' => 2, 'program_id' => 3],
            ['name' => 'DH - BSED Filipino', 'email' => 'dh.bsed.fil@cct.edu.ph', 'password' => 'cct@bsedfil2026', 'school_id' => 2, 'program_id' => 4],
            ['name' => 'DH - BSED Math', 'email' => 'dh.bsed.math@cct.edu.ph', 'password' => 'cct@bsedmath2026', 'school_id' => 2, 'program_id' => 5],
            ['name' => 'DH - BSED Social Studies', 'email' => 'dh.bsed.ss@cct.edu.ph', 'password' => 'cct@bsedss2026', 'school_id' => 2, 'program_id' => 6],

            // SHTM
            ['name' => 'DH - BSHM', 'email' => 'dh.bshm@cct.edu.ph', 'password' => 'cct@bshm2026', 'school_id' => 3, 'program_id' => 7],
            ['name' => 'DH - BSTM', 'email' => 'dh.bstm@cct.edu.ph', 'password' => 'cct@bstm2026', 'school_id' => 3, 'program_id' => 8],

            // SBM
            ['name' => 'DH - BSBA Marketing', 'email' => 'dh.bsba.mm@cct.edu.ph', 'password' => 'cct@bsbamm2026', 'school_id' => 6, 'program_id' => 11],
            ['name' => 'DH - BSBA HRDM', 'email' => 'dh.bsba.hrdm@cct.edu.ph', 'password' => 'cct@bsbahrdm2026', 'school_id' => 6, 'program_id' => 12],
            ['name' => 'DH - BSOA', 'email' => 'dh.bsoa@cct.edu.ph', 'password' => 'cct@bsoa2026', 'school_id' => 6, 'program_id' => 13],
        ];

        foreach ($deptHeads as $dh) {
            User::create([
                'name' => $dh['name'],
                'email' => $dh['email'],
                'password' => Hash::make($dh['password']),
                'role' => 'department_head',
                'school_id' => $dh['school_id'],
                'program_id' => $dh['program_id'],
                'is_active' => true,
            ]);
        }
    }
}