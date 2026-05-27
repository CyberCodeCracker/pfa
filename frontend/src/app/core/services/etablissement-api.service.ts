import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Etablissement } from '../models/etablissement.model';

@Injectable({ providedIn: 'root' })
export class EtablissementApiService {
  private base = `${environment.apiUrl}/v1/etablissements`;

  constructor(private http: HttpClient) {}

  list(): Observable<ApiResponse<Etablissement[]>> {
    return this.http.get<ApiResponse<Etablissement[]>>(this.base, { withCredentials: true });
  }
}
