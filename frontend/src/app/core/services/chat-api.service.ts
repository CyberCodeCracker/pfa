import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { Message, PrivateChat } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private base = `${environment.apiUrl}/v1/chats`;

  private _unreadPrivate$ = new BehaviorSubject<number>(0);
  readonly unreadPrivate$ = this._unreadPrivate$.asObservable();

  constructor(private http: HttpClient) {}

  setUnreadPrivate(count: number): void {
    this._unreadPrivate$.next(count);
  }

  getUnreadPrivateCount(): Observable<ApiResponse<{ unread_count: number }>> {
    return this.http.get<ApiResponse<{ unread_count: number }>>(
      `${this.base}/private/unread-count`,
      { withCredentials: true },
    ).pipe(tap(res => this._unreadPrivate$.next(res.data.unread_count)));
  }

  markPrivateChatRead(chatId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/private/${chatId}/read`, {}, { withCredentials: true });
  }

  listPrivateChats(): Observable<ApiResponse<PrivateChat[]>> {
    return this.http.get<ApiResponse<PrivateChat[]>>(`${this.base}/private`, { withCredentials: true });
  }

  getOrCreatePrivateChat(userId: number): Observable<ApiResponse<PrivateChat>> {
    return this.http.post<ApiResponse<PrivateChat>>(`${this.base}/private`, { user_id: userId }, { withCredentials: true });
  }

  getPrivateMessages(chatId: number, page = 1): Observable<PaginatedResponse<Message>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<PaginatedResponse<Message>>(`${this.base}/private/${chatId}/messages`, { params, withCredentials: true });
  }

  sendPrivateMessage(chatId: number, contenu: string): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(
      `${this.base}/private/${chatId}/messages`,
      { contenu },
      { withCredentials: true },
    );
  }

  getPublicMessages(stageId: number, page = 1): Observable<PaginatedResponse<Message>> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<PaginatedResponse<Message>>(`${this.base}/public/${stageId}/messages`, { params, withCredentials: true });
  }

  sendPublicMessage(stageId: number, contenu: string): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(
      `${this.base}/public/${stageId}/messages`,
      { contenu },
      { withCredentials: true },
    );
  }

  markRead(messageId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/v1/messages/${messageId}/read`, {}, { withCredentials: true });
  }
}
