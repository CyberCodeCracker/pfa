import { Etablissement } from './etablissement.model';
import { User } from './user.model';

export type StageStatut = 'brouillon' | 'actif' | 'archivé' | 'terminé';

export interface Stage {
  id: number;
  titre: string;
  description: string | null;
  date_debut: string;
  date_fin: string;
  statut: StageStatut;
  niveau: string | null;
  created_at: string;
  etablissement?: Etablissement;
  enseignant?: User;
  affectations?: Affectation[];
  etudiants_count?: number;
}

export interface Affectation {
  id: number;
  statut: 'invité' | 'actif' | 'retiré';
  date_affectation: string;
  invitation_sent_at: string | null;
  invitation_accepted_at: string | null;
  etudiant?: User;
}
