import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ReunionApiService } from '../../../core/services/reunion-api.service';
import { Reunion } from '../../../core/models/reunion.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { MeetingCreateDialogComponent } from '../meeting-create-dialog/meeting-create-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-stage-meetings',
  templateUrl: './stage-meetings.component.html',
  styleUrls: ['./stage-meetings.component.scss'],
})
export class StageMeetingsComponent implements OnInit, OnDestroy {
  @Input() stageId!: number;
  @Input() isArchived = false;

  reunions: Reunion[] = [];
  loading = false;
  isEnseignant = false;

  // Inline "terminer" form state
  terminerFormId: number | null = null;
  compteRenduDraft = '';
  saving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private reunionApi: ReunionApiService,
    private store: Store,
    private dialog: MatDialog,
    private toast: ToastService,
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
    this.reunionApi.list({ per_page: 50 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.reunions = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(MeetingCreateDialogComponent, {
      width: '560px',
      data: { stageId: this.stageId },
    });
    ref.afterClosed().subscribe(reunion => {
      if (reunion) this.reunions = [reunion, ...this.reunions];
    });
  }

  openTerminerForm(r: Reunion): void {
    this.terminerFormId = r.id;
    this.compteRenduDraft = '';
  }

  cancelTerminer(): void {
    this.terminerFormId = null;
    this.compteRenduDraft = '';
  }

  submitTerminer(r: Reunion): void {
    this.saving = true;
    this.reunionApi.terminer(r.id, this.compteRenduDraft.trim() || null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.reunions = this.reunions.map(x => x.id === res.data.id ? res.data : x);
          this.terminerFormId = null;
          this.compteRenduDraft = '';
          this.saving = false;
          this.toast.success('Réunion marquée comme terminée.');
        },
        error: err => {
          this.saving = false;
          this.toast.error(err.error?.message ?? 'Échec de l\'opération.');
        },
      });
  }

  annuler(reunion: Reunion): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'modern-dialog',
      data: {
        title: 'Annuler cette réunion ?',
        message: `"${reunion.sujet}" sera marquée comme annulée. Cette action est irréversible.`,
        confirmLabel: 'Annuler la réunion',
        variant: 'danger',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.reunionApi.annuler(reunion.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          this.reunions = this.reunions.map(r => r.id === res.data.id ? res.data : r);
          this.toast.success('Réunion annulée.');
        },
        error: err => this.toast.error(err.error?.message ?? 'Échec de l\'annulation.'),
      });
    });
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }
}
