import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api.model';

export interface AppNotification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private base = `${environment.apiUrl}/v1/notifications`;

  constructor(private http: HttpClient) {}

  list(): Observable<PaginatedResponse<AppNotification>> {
    return this.http.get<PaginatedResponse<AppNotification>>(this.base, { withCredentials: true });
  }

  markRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/read`, {}, { withCredentials: true });
  }

  markAllRead(): Observable<void> {
    return this.http.post<void>(`${this.base}/read-all`, {}, { withCredentials: true });
  }
}
