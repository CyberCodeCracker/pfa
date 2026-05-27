import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  csrfCookie(): Observable<void> {
    return this.http.get<void>(`${environment.baseUrl}/sanctum/csrf-cookie`, { withCredentials: true });
  }

  login(email: string, password: string, remember = false): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.api}/login`,
      { email, password, remember },
      { withCredentials: true }
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.api}/logout`, {}, { withCredentials: true });
  }

  me(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.api}/v1/me`, { withCredentials: true });
  }

  changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Observable<unknown> {
    return this.http.post(`${this.api}/v1/auth/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    }, { withCredentials: true });
  }

  acceptInvitation(token: string, newPassword: string, newPasswordConfirmation: string): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.api}/v1/auth/accept-invitation`, {
      token,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    }, { withCredentials: true });
  }

  forgotPassword(email: string): Observable<unknown> {
    return this.http.post(`${this.api}/v1/auth/forgot-password`, { email }, { withCredentials: true });
  }

  resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }): Observable<unknown> {
    return this.http.post(`${this.api}/v1/auth/reset-password`, data, { withCredentials: true });
  }
}
