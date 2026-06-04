export type MilestoneStatut = 'pending' | 'in_progress' | 'completed' | 'validated';

export interface Milestone {
  id: number;
  stage_id: number;
  titre: string;
  description: string | null;
  ordre: number;
  statut: MilestoneStatut;
  completed_at: string | null;
  validated_at: string | null;
  created_at: string;
}
