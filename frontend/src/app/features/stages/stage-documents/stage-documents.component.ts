import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DocumentApiService } from '../../../core/services/document-api.service';
import { Document, DocumentStatut } from '../../../core/models/document.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-stage-documents',
  templateUrl: './stage-documents.component.html',
  styleUrls: ['./stage-documents.component.scss'],
})
export class StageDocumentsComponent implements OnInit, OnDestroy {
  @Input() stageId!: number;

  documents: Document[] = [];
  loading = false;
  uploading = false;
  error: string | null = null;
  uploadError: string | null = null;
  isEnseignant = false;
  refusComment: Record<number, string> = {};
  confirmRefuseId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private docApi: DocumentApiService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.store.select(selectCurrentUser).pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.isEnseignant = u?.role === 'enseignant';
    });
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.docApi.list(this.stageId).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => { this.documents = res.data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.upload(file);
    input.value = '';
  }

  private upload(file: File): void {
    this.uploading = true;
    this.uploadError = null;
    this.docApi.upload(this.stageId, file).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.documents = [res.data, ...this.documents];
        this.uploading = false;
      },
      error: err => {
        this.uploadError = err.error?.message ?? 'Erreur lors de l\'envoi.';
        this.uploading = false;
      },
    });
  }

  valider(doc: Document): void {
    this.docApi.valider(doc.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => this.updateDoc(res.data),
    });
  }

  showRefuseForm(id: number): void {
    this.confirmRefuseId = id;
    this.refusComment[id] = '';
  }

  submitRefus(doc: Document): void {
    const comment = this.refusComment[doc.id]?.trim();
    if (!comment) return;
    this.docApi.refuser(doc.id, comment).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.updateDoc(res.data);
        this.confirmRefuseId = null;
      },
    });
  }

  deleteDoc(doc: Document): void {
    this.docApi.delete(doc.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.documents = this.documents.filter(d => d.id !== doc.id); },
    });
  }

  getDocById(id: number): Document | undefined {
    return this.documents.find(d => d.id === id);
  }

  trackById(_: number, doc: Document): number { return doc.id; }

  private updateDoc(updated: Document): void {
    this.documents = this.documents.map(d => d.id === updated.id ? updated : d);
  }

  getStatutClass(statut: DocumentStatut): string {
    const m: Record<DocumentStatut, string> = {
      en_attente: 'chip-pending',
      validé: 'chip-valid',
      refusé: 'chip-refused',
    };
    return m[statut] ?? '';
  }

  getStatutLabel(statut: DocumentStatut): string {
    const m: Record<DocumentStatut, string> = {
      en_attente: 'En attente',
      validé: 'Validé',
      refusé: 'Refusé',
    };
    return m[statut] ?? statut;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  }

  getMimeIcon(mime: string): string {
    if (mime.includes('pdf')) return 'picture_as_pdf';
    if (mime.includes('word') || mime.includes('document')) return 'description';
    if (mime.includes('image')) return 'image';
    if (mime.includes('zip')) return 'folder_zip';
    if (mime.includes('sheet') || mime.includes('csv')) return 'table_chart';
    return 'insert_drive_file';
  }
}
