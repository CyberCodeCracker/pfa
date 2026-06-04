import { Etablissement } from './etablissement.model';
import { User } from './user.model';

export type StageStatut = 'brouillon' | 'actif' | 'archivé' | 'terminé';

export type Semestre = 'S1' | 'S2';

export interface Stage {
  id: number;
  titre: string;
  description: string | null;
  date_debut: string;
  date_fin: string;
  statut: StageStatut;
  niveau: string | null;
  annee_academique: string | null;
  semestre: Semestre | null;
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
