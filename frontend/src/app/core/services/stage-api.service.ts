import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { Stage } from '../models/stage.model';

export interface StageFilters {
  page?: number;
  per_page?: number;
  search?: string;
  'filter[statut]'?: string;
  'filter[etablissement_id]'?: number;
  'filter[annee_academique]'?: string;
  'filter[semestre]'?: string;
  sort?: string;
}

export interface CreateStagePayload {
  titre: string;
  description?: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  niveau?: string;
  annee_academique?: string;
  semestre?: string;
  etablissement_id: number;
}

export interface AffecterEtudiantsPayload {
  etudiants: { nom: string; prenom: string; email: string }[];
}

@Injectable({ providedIn: 'root' })
export class StageApiService {
  private base = `${environment.apiUrl}/v1/stages`;

  constructor(private http: HttpClient) {}

  list(filters: StageFilters = {}): Observable<PaginatedResponse<Stage>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<PaginatedResponse<Stage>>(this.base, { params, withCredentials: true });
  }

  get(id: number): Observable<ApiResponse<Stage>> {
    return this.http.get<ApiResponse<Stage>>(`${this.base}/${id}`, { withCredentials: true });
  }

  create(payload: CreateStagePayload): Observable<ApiResponse<Stage>> {
    return this.http.post<ApiResponse<Stage>>(this.base, payload, { withCredentials: true });
  }

  update(id: number, payload: Partial<CreateStagePayload>): Observable<ApiResponse<Stage>> {
    return this.http.patch<ApiResponse<Stage>>(`${this.base}/${id}`, payload, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { withCredentials: true });
  }

  affecter(id: number, payload: AffecterEtudiantsPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/${id}/affectations`, payload, { withCredentials: true });
  }

  retirerEtudiant(stageId: number, etudiantId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${stageId}/affectations/${etudiantId}`, { withCredentials: true });
  }
}
