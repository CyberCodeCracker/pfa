<?php

namespace Database\Seeders;

use App\Models\Etablissement;
use Illuminate\Database\Seeder;

class EtablissementSeeder extends Seeder
{
    public function run(): void
    {
        $etablissements = [
            ['nom' => 'IIT',      'code' => 'IIT',     'ville' => 'Sfax'],
            ['nom' => 'ISET',     'code' => 'ISET',    'ville' => 'Sfax'],
            ['nom' => "ENET'COM", 'code' => 'ENETCOM', 'ville' => 'Sfax'],
            ['nom' => 'ISIMS',    'code' => 'ISIMS',   'ville' => 'Sfax'],
            ['nom' => 'ENIS',     'code' => 'ENIS',    'ville' => 'Sfax'],
            ['nom' => 'ISGIS',    'code' => 'ISGIS',   'ville' => 'Sfax'],
        ];

        foreach ($etablissements as $data) {
            Etablissement::updateOrCreate(['code' => $data['code']], $data);
        }
    }
}
