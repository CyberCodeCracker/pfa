import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { StageApiService } from '../../../core/services/stage-api.service';
import { Affectation } from '../../../core/models/stage.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-stage-students',
  templateUrl: './stage-students.component.html',
  styleUrls: ['./stage-students.component.scss'],
})
export class StageStudentsComponent implements OnInit, OnDestroy {
  @Input() stageId!: number;

  affectations: Affectation[] = [];
  loading = false;
  error: string | null = null;
  showAddForm = false;
  addError: string | null = null;
  addLoading = false;
  confirmRetirerId: number | null = null;

  addForm!: FormGroup;

  currentUser$ = this.store.select(selectCurrentUser);
  isEnseignant = false;

  private destroy$ = new Subject<void>();

  constructor(
    private stageApi: StageApiService,
    private fb: FormBuilder,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.addForm = this.fb.group({
      nom:    ['', Validators.required],
      prenom: ['', Validators.required],
      email:  ['', [Validators.required, Validators.email]],
    });

    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.isEnseignant = u?.role === 'enseignant';
    });

    this.loadAffectations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAffectations(): void {
    this.loading = true;
    this.stageApi.get(this.stageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.affectations = res.data.affectations ?? [];
          this.loading = false;
        },
        error: err => {
          this.error = err.error?.message ?? 'Erreur de chargement.';
          this.loading = false;
        },
      });
  }

  addStudent(): void {
    if (this.addForm.invalid) return;
    this.addLoading = true;
    this.addError = null;

    this.stageApi.affecter(this.stageId, {
      etudiants: [this.addForm.value],
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.addForm.reset();
        this.showAddForm = false;
        this.addLoading = false;
        this.loadAffectations();
      },
      error: err => {
        this.addError = err.error?.message ?? 'Erreur lors de l\'ajout.';
        this.addLoading = false;
      },
    });
  }

  confirmRetirer(etudiantId: number): void {
    this.confirmRetirerId = etudiantId;
  }

  retirer(etudiantId: number): void {
    this.stageApi.retirerEtudiant(this.stageId, etudiantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.confirmRetirerId = null;
          this.loadAffectations();
        },
        error: err => {
          this.error = err.error?.message ?? 'Erreur.';
          this.confirmRetirerId = null;
        },
      });
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      invité: 'Invité',
      actif: 'Actif',
      retiré: 'Retiré',
    };
    return map[statut] ?? statut;
  }

  trackByAff(_: number, item: Affectation): number {
    return item.id;
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      invité: 'chip-invited',
      actif: 'chip-active',
      retiré: 'chip-removed',
    };
    return map[statut] ?? '';
  }
}
