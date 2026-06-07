import { User } from './user.model';

export type ChatType = 'public' | 'private';

export interface Message {
  id: number;
  chat_type: ChatType;
  chat_id: number;
  contenu: string;
  has_attachment: boolean;
  attachment_mime: string | null;
  created_at: string;
  edited_at: string | null;
  sender?: User;
}

export interface PrivateChat {
  id: number;
  enseignant?: User;
  etudiant?: User;
  unread_count?: number;
  created_at: string;
}
