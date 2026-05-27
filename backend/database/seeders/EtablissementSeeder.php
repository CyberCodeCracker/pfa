<?php

namespace Database\Seeders;

use App\Models\Etablissement;
use Illuminate\Database\Seeder;

class EtablissementSeeder extends Seeder
{
    public function run(): void
    {
        $etablissements = [
            ['nom' => 'IIT',      'code' => 'IIT',     'ville' => 'Tunis'],
            ['nom' => 'ISET',     'code' => 'ISET',    'ville' => 'Tunis'],
            ['nom' => "ENET'COM", 'code' => 'ENETCOM', 'ville' => 'Sfax'],
            ['nom' => 'ISIMS',    'code' => 'ISIMS',   'ville' => 'Monastir'],
            ['nom' => 'ENIS',     'code' => 'ENIS',    'ville' => 'Sfax'],
        ];

        foreach ($etablissements as $data) {
            Etablissement::firstOrCreate(['code' => $data['code']], $data);
        }
    }
}
