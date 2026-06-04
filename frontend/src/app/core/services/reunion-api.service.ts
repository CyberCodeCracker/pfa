import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { Reunion } from '../models/reunion.model';

export interface CreateReunionPayload {
  sujet: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  meet_url?: string;
  participant_ids: number[];
}

@Injectable({ providedIn: 'root' })
export class ReunionApiService {
  private base = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  list(params: {
    page?: number;
    per_page?: number;
    annee_academique?: string;
    semestre?: string;
    etablissement_id?: number | null;
  } = {}): Observable<PaginatedResponse<Reunion>> {
    let p = new HttpParams();
    if (params.page) p = p.set('page', String(params.page));
    if (params.per_page) p = p.set('per_page', String(params.per_page));
    if (params.annee_academique) p = p.set('annee_academique', params.annee_academique);
    if (params.semestre) p = p.set('semestre', params.semestre);
    if (params.etablissement_id) p = p.set('etablissement_id', String(params.etablissement_id));
    return this.http.get<PaginatedResponse<Reunion>>(`${this.base}/reunions`, { params: p, withCredentials: true });
  }

  create(stageId: number, payload: CreateReunionPayload): Observable<ApiResponse<Reunion>> {
    return this.http.post<ApiResponse<Reunion>>(
      `${this.base}/stages/${stageId}/reunions`,
      payload,
      { withCredentials: true },
    );
  }

  update(id: number, payload: Partial<CreateReunionPayload>): Observable<ApiResponse<Reunion>> {
    return this.http.patch<ApiResponse<Reunion>>(`${this.base}/reunions/${id}`, payload, { withCredentials: true });
  }

  annuler(id: number): Observable<ApiResponse<Reunion>> {
    return this.http.post<ApiResponse<Reunion>>(`${this.base}/reunions/${id}/annuler`, {}, { withCredentials: true });
  }

  repondre(reunionId: number, userId: number, statut: string): Observable<void> {
    return this.http.post<void>(
      `${this.base}/reunions/${reunionId}/participants/${userId}/reponse`,
      { statut },
      { withCredentials: true },
    );
  }
}
