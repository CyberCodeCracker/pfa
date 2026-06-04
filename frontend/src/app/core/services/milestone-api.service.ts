import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Milestone } from '../models/milestone.model';

export interface CreateMilestonePayload {
  titre: string;
  description?: string;
}

export interface UpdateMilestonePayload {
  titre?: string;
  description?: string;
  ordre?: number;
}

@Injectable({ providedIn: 'root' })
export class MilestoneApiService {
  private base = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  list(stageId: number): Observable<{ data: Milestone[] }> {
    return this.http.get<{ data: Milestone[] }>(`${this.base}/stages/${stageId}/milestones`, { withCredentials: true });
  }

  create(stageId: number, payload: CreateMilestonePayload): Observable<ApiResponse<Milestone>> {
    return this.http.post<ApiResponse<Milestone>>(`${this.base}/stages/${stageId}/milestones`, payload, { withCredentials: true });
  }

  update(id: number, payload: UpdateMilestonePayload): Observable<ApiResponse<Milestone>> {
    return this.http.patch<ApiResponse<Milestone>>(`${this.base}/milestones/${id}`, payload, { withCredentials: true });
  }

  destroy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/milestones/${id}`, { withCredentials: true });
  }

  markComplete(id: number): Observable<ApiResponse<Milestone>> {
    return this.http.post<ApiResponse<Milestone>>(`${this.base}/milestones/${id}/complete`, {}, { withCredentials: true });
  }

  validate(id: number): Observable<ApiResponse<Milestone>> {
    return this.http.post<ApiResponse<Milestone>>(`${this.base}/milestones/${id}/validate`, {}, { withCredentials: true });
  }

  reopen(id: number): Observable<ApiResponse<Milestone>> {
    return this.http.post<ApiResponse<Milestone>>(`${this.base}/milestones/${id}/reopen`, {}, { withCredentials: true });
  }
}
