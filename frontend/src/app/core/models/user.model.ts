export type UserRole = 'enseignant' | 'etudiant';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  role: UserRole;
  must_change_password: boolean;
  email_verified: boolean;
  created_at: string;
}
