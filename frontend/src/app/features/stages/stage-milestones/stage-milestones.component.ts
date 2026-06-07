import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Milestone, MilestoneStatut } from '../../../core/models/milestone.model';
import { MilestoneApiService } from '../../../core/services/milestone-api.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-stage-milestones',
  templateUrl: './stage-milestones.component.html',
  styleUrls: ['./stage-milestones.component.scss'],
})
export class StageMilestonesComponent implements OnInit, OnDestroy {
  @Input() stageId!: number;
  @Input() isArchived = false;

  milestones: Milestone[] = [];
  loading = true;
  saving = false;
  isEnseignant = false;

  // Inline create / edit state
  adding = false;
  newTitre = '';
  newDescription = '';
  newOrdre: number | null = null;
  addError: string | null = null;
  editingId: number | null = null;
  editTitre = '';
  editDescription = '';
  editOrdre: number | null = null;
  editError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private milestoneApi: MilestoneApiService,
    private store: Store,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isEnseignant = user?.role === 'enseignant';
      });
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.milestoneApi.list(this.stageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => { this.milestones = res.data; this.loading = false; },
        error: () => { this.loading = false; },
      });
  }

  get doneCount(): number {
    return this.milestones.filter(m => m.statut === 'completed' || m.statut === 'validated').length;
  }

  get validatedCount(): number {
    return this.milestones.filter(m => m.statut === 'validated').length;
  }

  get totalCount(): number {
    return this.milestones.length;
  }

  statutLabel(s: MilestoneStatut): string {
    return {
      pending:     'À venir',
      in_progress: 'En cours',
      completed:   'À valider',
      validated:   'Validé',
    }[s];
  }

  statutClass(s: MilestoneStatut): string {
    return {
      pending:     'bg-surface-container text-on-surface-variant',
      in_progress: 'bg-tertiary-container text-on-tertiary-container',
      completed:   'bg-secondary-container text-on-secondary-container',
      validated:   'bg-primary-container text-on-primary-container',
    }[s];
  }

  statutIcon(s: MilestoneStatut): string {
    return {
      pending:     'radio_button_unchecked',
      in_progress: 'sync',
      completed:   'pending',
      validated:   'check_circle',
    }[s];
  }

  get nextOrdre(): number {
    return this.milestones.length + 1;
  }

  /** First position that can safely accept a new step — right after the last completed/validated step. */
  get minInsertOrdre(): number {
    let lastLocked = 0;
    for (const m of this.milestones) {
      if (m.statut === 'validated' || m.statut === 'completed') {
        if (m.ordre > lastLocked) lastLocked = m.ordre;
      }
    }
    return lastLocked + 1;
  }

  /** True when the chosen position is invalid (before a locked step) */
  get newOrdreInvalid(): boolean {
    if (this.newOrdre == null) return false;
    return this.newOrdre < this.minInsertOrdre;
  }

  startAdd(): void {
    this.adding = true;
    this.newTitre = '';
    this.newDescription = '';
    this.newOrdre = this.nextOrdre;
    this.addError = null;
  }

  cancelAdd(): void {
    this.adding = false;
    this.addError = null;
  }

  saveAdd(): void {
    if (!this.newTitre.trim()) return;
    const ordre = this.newOrdre ?? this.nextOrdre;

    if (ordre < this.minInsertOrdre) {
      const blocker = this.milestones.find(m =>
        m.ordre >= ordre && (m.statut === 'validated' || m.statut === 'completed')
      );
      const label = blocker?.statut === 'validated' ? 'validée' : 'en attente de validation';
      this.addError = blocker
        ? `Impossible d'insérer à la position ${ordre} : l'étape "${blocker.titre}" (position ${blocker.ordre}) est déjà ${label}. Choisissez une position ≥ ${this.minInsertOrdre}.`
        : `Position invalide.`;
      return;
    }

    this.addError = null;
    this.saving = true;

    this.milestoneApi.create(this.stageId, {
      titre: this.newTitre.trim(),
      description: this.newDescription.trim() || undefined,
      ordre,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.adding = false;
          this.saving = false;
          this.toast.success(`Étape "${res.data.titre}" ajoutée.`);
          this.load();
        },
        error: err => {
          this.saving = false;
          const msg = err.error?.message ?? 'Échec de l\'ajout de l\'étape.';
          this.addError = msg;
          this.toast.error(msg);
        },
      });
  }

  startEdit(m: Milestone): void {
    this.editingId = m.id;
    this.editTitre = m.titre;
    this.editDescription = m.description ?? '';
    this.editOrdre = m.ordre;
    this.editError = null;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editError = null;
  }

  saveEdit(m: Milestone): void {
    if (!this.editTitre.trim()) return;
    this.editError = null;
    this.saving = true;

    const payload: any = {
      titre: this.editTitre.trim(),
      description: this.editDescription.trim() || undefined,
    };
    if (this.editOrdre != null && this.editOrdre !== m.ordre) {
      payload.ordre = this.editOrdre;
    }

    this.milestoneApi.update(m.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.editingId = null;
          this.saving = false;
          this.toast.success('Étape mise à jour.');
          // If position changed, reload to reflect shifts
          if (payload.ordre !== undefined) {
            this.load();
          } else {
            const i = this.milestones.findIndex(x => x.id === m.id);
            if (i >= 0) this.milestones[i] = res.data;
          }
        },
        error: err => {
          this.saving = false;
          const msg = err.error?.message ?? 'Échec de la mise à jour.';
          this.editError = msg;
          this.toast.error(msg);
        },
      });
  }

  delete(m: Milestone): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'modern-dialog',
      data: {
        title: 'Supprimer cette étape ?',
        message: `"${m.titre}" sera définitivement supprimée. Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        variant: 'danger',
      },
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.milestoneApi.destroy(m.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.milestones = this.milestones.filter(x => x.id !== m.id);
            this.toast.success('Étape supprimée.');
          },
          error: err => this.toast.error(err.error?.message ?? 'Échec de la suppression.'),
        });
    });
  }

  markComplete(m: Milestone): void {
    this.milestoneApi.markComplete(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => { this.replace(res.data); this.toast.success('Étape marquée comme terminée.'); },
        error: err => this.toast.error(err.error?.message ?? 'Action impossible.'),
      });
  }

  canValidate(m: Milestone): boolean {
    // All steps with a lower ordre must already be validated
    return this.milestones
      .filter(x => x.ordre < m.ordre)
      .every(x => x.statut === 'validated');
  }

  validate(m: Milestone): void {
    this.milestoneApi.validate(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => { this.replace(res.data); this.toast.success('Étape validée.'); },
        error: err => this.toast.error(err.error?.message ?? 'Validation impossible.'),
      });
  }

  reopen(m: Milestone): void {
    this.milestoneApi.reopen(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => { this.replace(res.data); this.toast.info('Étape rouverte.'); },
        error: err => this.toast.error(err.error?.message ?? 'Action impossible.'),
      });
  }

  private replace(updated: Milestone): void {
    const i = this.milestones.findIndex(x => x.id === updated.id);
    if (i >= 0) this.milestones[i] = updated;
  }

  trackById(_: number, m: Milestone): number {
    return m.id;
  }
}
