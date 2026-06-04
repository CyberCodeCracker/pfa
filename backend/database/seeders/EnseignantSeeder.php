<?php

namespace Database\Seeders;

use App\Models\Etablissement;
use App\Models\EnseignantProfile;
use App\Models\User;
use App\Support\Enums\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EnseignantSeeder extends Seeder
{
    public function run(): void
    {
        $enseignants = [
            ['prenom' => 'Mohamed',  'nom' => 'Ben Ali',   'grade' => 'Maître de conférences', 'specialite' => 'Informatique'],
            ['prenom' => 'Ahmed',    'nom' => 'Trabelsi',  'grade' => 'Professeur',             'specialite' => 'Réseaux'],
            ['prenom' => 'Youssef',  'nom' => 'Gharbi',    'grade' => 'Maître assistant',       'specialite' => 'Génie logiciel'],
            ['prenom' => 'Sami',     'nom' => 'Jebali',    'grade' => 'Maître de conférences', 'specialite' => 'Systèmes embarqués'],
            ['prenom' => 'Walid',    'nom' => 'Mhiri',     'grade' => 'Professeur',             'specialite' => 'Intelligence artificielle'],
            ['prenom' => 'Karim',    'nom' => 'Bouzidi',   'grade' => 'Maître assistant',       'specialite' => 'Base de données'],
            ['prenom' => 'Nizar',    'nom' => 'Hamdi',     'grade' => 'Maître de conférences', 'specialite' => 'Sécurité informatique'],
            ['prenom' => 'Fethi',    'nom' => 'Saidi',     'grade' => 'Professeur',             'specialite' => 'Développement web'],
        ];

        $etablissements = Etablissement::all()->keyBy('code');

        foreach ($enseignants as $index => $data) {
            $email = strtolower($data['prenom'] . '.' . str_replace(' ', '', $data['nom'])) . '@enseignant.pfa.tn';

            $user = User::firstOrCreate(['email' => $email], [
                'nom'    => $data['nom'],
                'prenom' => $data['prenom'],
                'email'  => $email,
                'password' => Hash::make('Password123!'),
                'role'   => Role::Enseignant,
                'email_verified_at' => now(),
            ]);

            $profile = EnseignantProfile::firstOrCreate(['user_id' => $user->id], [
                'grade'      => $data['grade'],
                'specialite' => $data['specialite'],
            ]);

            // Assign to 2–4 établissements (enseignants typically teach across multiple schools)
            $nbEtabs = rand(2, min(4, $etablissements->count()));
            $assigned = $etablissements->random($nbEtabs);
            foreach ($assigned as $etab) {
                if (!$profile->etablissements()->where('etablissements.id', $etab->id)->exists()) {
                    $profile->etablissements()->attach($etab->id);
                }
            }
        }
    }
}
