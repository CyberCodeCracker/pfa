import { User } from './user.model';

export type DocumentStatut = 'en_attente' | 'validé' | 'refusé';

export interface Document {
  id: number;
  nom: string;
  mime: string;
  taille: number;
  statut: DocumentStatut;
  commentaire: string | null;
  version: number;
  parent_document_id: number | null;
  date_upload: string;
  download_url?: string;
  uploader?: User;
}
