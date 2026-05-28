<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            EtablissementSeeder::class,
            EnseignantSeeder::class,
            EtudiantSeeder::class,
            StageSeeder::class,
            ReunionSeeder::class,
        ]);
    }
}
