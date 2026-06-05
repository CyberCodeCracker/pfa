import { Etablissement } from './etablissement.model';
import { Milestone } from './milestone.model';
import { User } from './user.model';

export type StageStatut = 'actif' | 'suspendu' | 'terminé';
export type PaceIndicator = 'ahead' | 'on_track' | 'behind' | 'at_risk';

export type Semestre = 'ete' | 'pfe' | 'pfa';

export interface Stage {
  id: number;
  titre: string;
  description: string | null;
  date_debut: string;
  date_fin: string;
  statut: StageStatut;
  pace_indicator: PaceIndicator | null;
  niveau: string | null;
  annee_academique: string | null;
  semestre: Semestre | null;
  created_at: string;
  etablissement?: Etablissement;
  enseignant?: User;
  affectations?: Affectation[];
  etudiants_count?: number;
  milestones?: Milestone[];
  milestones_count?: number;
  milestones_done_count?: number;
}

export interface Affectation {
  id: number;
  statut: 'invité' | 'actif' | 'retiré';
  date_affectation: string;
  invitation_sent_at: string | null;
  invitation_accepted_at: string | null;
  etudiant?: User;
}
