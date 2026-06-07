import { User } from './user.model';
import { Stage } from './stage.model';

export type ReunionStatut = 'planifiée' | 'terminée' | 'annulée';

export interface Reunion {
  id: number;
  sujet: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meet_url: string | null;
  statut: ReunionStatut;
  compte_rendu: string | null;
  terminated_at: string | null;
  created_at: string;
  stage?: Stage;
  enseignant?: User;
  participants?: User[];
}
