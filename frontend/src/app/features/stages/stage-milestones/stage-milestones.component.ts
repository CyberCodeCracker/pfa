import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Milestone, MilestoneStatut } from '../../../core/models/milestone.model';
import { MilestoneApiService } from '../../../core/services/milestone-api.service';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-stage-milestones',
  templateUrl: './stage-milestones.component.html',
  styleUrls: ['./stage-milestones.component.scss'],
})
export class StageMilestonesComponent implements OnInit, OnDestroy {
  @Input() stageId!: number;

  milestones: Milestone[] = [];
  loading = true;
  saving = false;
  isEnseignant = false;

  // Inline create / edit state
  adding = false;
  newTitre = '';
  newDescription = '';
  editingId: number | null = null;
  editTitre = '';
  editDescription = '';

  private destroy$ = new Subject<void>();

  constructor(
    private milestoneApi: MilestoneApiService,
    private store: Store,
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

  startAdd(): void {
    this.adding = true;
    this.newTitre = '';
    this.newDescription = '';
  }

  cancelAdd(): void {
    this.adding = false;
  }

  saveAdd(): void {
    if (!this.newTitre.trim()) return;
    this.saving = true;
    this.milestoneApi.create(this.stageId, {
      titre: this.newTitre.trim(),
      description: this.newDescription.trim() || undefined,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.milestones.push(res.data);
          this.adding = false;
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
  }

  startEdit(m: Milestone): void {
    this.editingId = m.id;
    this.editTitre = m.titre;
    this.editDescription = m.description ?? '';
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(m: Milestone): void {
    if (!this.editTitre.trim()) return;
    this.saving = true;
    this.milestoneApi.update(m.id, {
      titre: this.editTitre.trim(),
      description: this.editDescription.trim() || undefined,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          const i = this.milestones.findIndex(x => x.id === m.id);
          if (i >= 0) this.milestones[i] = res.data;
          this.editingId = null;
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
  }

  delete(m: Milestone): void {
    if (!confirm(`Supprimer la milestone "${m.titre}" ?`)) return;
    this.milestoneApi.destroy(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.milestones = this.milestones.filter(x => x.id !== m.id); },
      });
  }

  markComplete(m: Milestone): void {
    this.milestoneApi.markComplete(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => this.replace(res.data),
      });
  }

  validate(m: Milestone): void {
    this.milestoneApi.validate(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => this.replace(res.data),
      });
  }

  reopen(m: Milestone): void {
    this.milestoneApi.reopen(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => this.replace(res.data),
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
