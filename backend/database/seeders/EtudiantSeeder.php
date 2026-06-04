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
        // Arabic-origin names (transliterated)
        $prenoms = ['Mohamed', 'Ahmed', 'Ali', 'Omar', 'Youssef', 'Karim', 'Sami', 'Walid',
                    'Hamza', 'Bilel', 'Aymen', 'Hatem', 'Mehdi', 'Rami', 'Tarek', 'Yassine',
                    'Zied', 'Anis', 'Khaled', 'Hichem', 'Skander', 'Marouen',
                    'Mariam', 'Fatma', 'Aicha', 'Salma', 'Sarra', 'Yasmine', 'Amira', 'Rim',
                    'Nour', 'Ines', 'Imen', 'Manel', 'Olfa', 'Asma', 'Hanen', 'Wafa',
                    'Marwa', 'Sana', 'Sirine', 'Wiem'];
        $noms = ['Ben Ali', 'Trabelsi', 'Gharbi', 'Jebali', 'Mhiri', 'Bouzidi', 'Hamdi', 'Saidi',
                 'Khelifi', 'Mansouri', 'Chaabane', 'Sassi', 'Mejri', 'Karoui', 'Ayari', 'Tlili',
                 'Nasri', 'Abdallah', 'Ghozzi', 'Mathlouthi', 'Triki', 'Bouaziz', 'Lahmer', 'Souissi'];
        $niveaux = ['Licence 3', 'Master 1', 'Master 2', 'Ingénierie 2', 'Ingénierie 3'];
        $specialites = ['Informatique', 'Réseaux', 'IA', 'Génie logiciel', 'Cybersécurité', 'Data science'];

        $etablissements = Etablissement::all();
        if ($etablissements->isEmpty()) return;

        $count = 0;
        foreach ($etablissements as $etab) {
            for ($i = 0; $i < 15; $i++) {
                $prenom = $prenoms[array_rand($prenoms)];
                $nom    = $noms[array_rand($noms)];
                $emailNom = strtolower(str_replace(' ', '', $nom));
                $emailPrenom = strtolower($prenom);
                $email  = $emailPrenom . '.' . $emailNom . $count . '@etudiant.pfa.tn';
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
