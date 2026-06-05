import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { Document } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentApiService {
  private base = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  list(stageId: number): Observable<PaginatedResponse<Document>> {
    return this.http.get<PaginatedResponse<Document>>(
      `${this.base}/stages/${stageId}/documents`,
      { withCredentials: true },
    );
  }

  upload(stageId: number, file: File, options: { parentDocumentId?: number; isReport?: boolean } = {}): Observable<ApiResponse<Document>> {
    const fd = new FormData();
    fd.append('fichier', file);
    if (options.parentDocumentId) fd.append('parent_document_id', String(options.parentDocumentId));
    if (options.isReport) fd.append('is_report', '1');
    return this.http.post<ApiResponse<Document>>(
      `${this.base}/stages/${stageId}/documents`,
      fd,
      { withCredentials: true },
    );
  }

  delete(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/documents/${documentId}`, { withCredentials: true });
  }

  valider(documentId: number): Observable<ApiResponse<Document>> {
    return this.http.post<ApiResponse<Document>>(
      `${this.base}/documents/${documentId}/valider`,
      {},
      { withCredentials: true },
    );
  }

  refuser(documentId: number, commentaire: string): Observable<ApiResponse<Document>> {
    return this.http.post<ApiResponse<Document>>(
      `${this.base}/documents/${documentId}/refuser`,
      { commentaire },
      { withCredentials: true },
    );
  }

  annotate(documentId: number, payload: { teacher_comment?: string | null; teacher_note?: string | null }): Observable<ApiResponse<Document>> {
    return this.http.post<ApiResponse<Document>>(
      `${this.base}/documents/${documentId}/annotate`,
      payload,
      { withCredentials: true },
    );
  }
}
