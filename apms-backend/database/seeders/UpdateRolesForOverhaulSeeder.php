<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UpdateRolesForOverhaulSeeder extends Seeder
{
    public function run(): void
    {
        $exists = User::where('role', 'registrar')->exists();

        if ($exists) {
            $this->command->info('A registrar account already exists — nothing to do.');
            return;
        }

        User::create([
            'name' => 'Registrar Demo',
            'email' => 'registrar@cct.edu.ph',
            'password' => Hash::make('password'), // change before any real demo/defense
            'role' => 'registrar',
            'is_active' => true,
        ]);

        $this->command->info('Created a demo registrar account: registrar@cct.edu.ph');
    }
}