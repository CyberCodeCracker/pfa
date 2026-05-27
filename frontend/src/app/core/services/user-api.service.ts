import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private base = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  listStudents(params: { search?: string; page?: number; per_page?: number } = {}): Observable<PaginatedResponse<User>> {
    let p = new HttpParams();
    p = p.set('filter[role]', 'etudiant');
    if (params.search) p = p.set('search', params.search);
    if (params.page) p = p.set('page', String(params.page));
    if (params.per_page) p = p.set('per_page', String(params.per_page));
    return this.http.get<PaginatedResponse<User>>(`${this.base}/etudiants`, { params: p, withCredentials: true });
  }
}
