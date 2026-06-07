import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  private _unreadCount$ = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this._unreadCount$.asObservable();

  constructor(private http: HttpClient) {}

  list(): Observable<PaginatedResponse<AppNotification>> {
    return this.http.get<PaginatedResponse<AppNotification>>(this.base, { withCredentials: true });
  }

  markRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/read`, {}, { withCredentials: true }).pipe(
      tap(() => {
        const current = this._unreadCount$.value;
        if (current > 0) this._unreadCount$.next(current - 1);
      }),
    );
  }

  markAllRead(): Observable<void> {
    return this.http.post<void>(`${this.base}/read-all`, {}, { withCredentials: true }).pipe(
      tap(() => this._unreadCount$.next(0)),
    );
  }

  setUnreadCount(count: number): void {
    this._unreadCount$.next(count);
  }

  incrementUnread(): void {
    this._unreadCount$.next(this._unreadCount$.value + 1);
  }
}
