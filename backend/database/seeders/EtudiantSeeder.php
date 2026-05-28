<?php

namespace Database\Seeders;

use App\Models\Etablissement;
use App\Models\EtudiantProfile;
use App\Models\User;
use App\Support\Enums\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EtudiantSeeder extends Seeder
{
    public function run(): void
    {
        // French names (per project decision — only enseignants use Arabic-origin names)
        $prenoms = ['Julien', 'Sophie', 'Lucas', 'Emma', 'Hugo', 'Léa', 'Nathan', 'Camille',
                    'Ethan', 'Manon', 'Théo', 'Chloé', 'Maxime', 'Sarah', 'Antoine', 'Jade',
                    'Romain', 'Inès', 'Adrien', 'Louise'];
        $noms = ['Mercier', 'Lefebvre', 'Rousseau', 'Garnier', 'Faure', 'Bernard', 'Dubois',
                 'Moreau', 'Laurent', 'Simon', 'Michel', 'Petit', 'Robert', 'Richard', 'Durand',
                 'Leroy', 'David', 'Bertrand', 'Roux', 'Vincent'];
        $niveaux = ['Licence 3', 'Master 1', 'Master 2', 'Ingénierie 2', 'Ingénierie 3'];
        $specialites = ['Informatique', 'Réseaux', 'IA', 'Génie logiciel', 'Cybersécurité', 'Data science'];

        $etablissements = Etablissement::all();
        if ($etablissements->isEmpty()) return;

        $count = 0;
        foreach ($etablissements as $etab) {
            for ($i = 0; $i < 8; $i++) {
                $prenom = $prenoms[array_rand($prenoms)];
                $nom    = $noms[array_rand($noms)];
                $email  = strtolower($prenom . '.' . $nom . $count . '@etudiant.pfa.tn');
                $count++;

                $user = User::firstOrCreate(['email' => $email], [
                    'nom'      => strtoupper($nom),
                    'prenom'   => $prenom,
                    'password' => Hash::make('Password123!'),
                    'role'     => Role::Etudiant,
                    'must_change_password' => false,
                    'email_verified_at'    => now(),
                ]);

                EtudiantProfile::firstOrCreate(['user_id' => $user->id], [
                    'niveau'           => $niveaux[array_rand($niveaux)],
                    'specialite'       => $specialites[array_rand($specialites)],
                    'groupe'           => 'G' . rand(1, 4),
                    'etablissement_id' => $etab->id,
                ]);
            }
        }
    }
}
