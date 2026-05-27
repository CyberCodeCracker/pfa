import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';

export interface Feedback {
  id: number;
  contenu: string;
  note: number | null;
  created_at: string;
  enseignant?: { id: number; prenom: string; nom: string };
  etudiant?: { id: number; prenom: string; nom: string };
}

export interface CreateFeedbackPayload {
  etudiant_id: number;
  contenu: string;
  note?: number;
  document_id?: number;
}

@Injectable({ providedIn: 'root' })
export class FeedbackApiService {
  private base = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  list(stageId: number): Observable<{ data: Feedback[] }> {
    return this.http.get<{ data: Feedback[] }>(
      `${this.base}/stages/${stageId}/feedbacks`,
      { withCredentials: true },
    );
  }

  create(stageId: number, payload: CreateFeedbackPayload): Observable<ApiResponse<Feedback>> {
    return this.http.post<ApiResponse<Feedback>>(
      `${this.base}/stages/${stageId}/feedbacks`,
      payload,
      { withCredentials: true },
    );
  }
}
