import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { StageApiService, CreateStagePayload } from '../../../core/services/stage-api.service';
import { EtablissementApiService } from '../../../core/services/etablissement-api.service';
import { Etablissement } from '../../../core/models/etablissement.model';
import { Stage } from '../../../core/models/stage.model';
import { selectFilter } from '../../../store/filter/filter.selectors';

@Component({
  selector: 'app-stage-form',
  templateUrl: './stage-form.component.html',
  styleUrls: ['./stage-form.component.scss'],
})
export class StageFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  stageId: number | null = null;
  loading = false;
  loadingEtablissements = false;
  error: string | null = null;
  etablissements: Etablissement[] = [];
  private destroy$ = new Subject<void>();

  readonly statuts = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'actif', label: 'Actif' },
  ];

  readonly niveaux = [
    'Licence 3',
    'Master 1',
    'Master 2',
    'Ingénierie 1',
    'Ingénierie 2',
    'Ingénierie 3',
    'BTS',
    'DUT',
  ];

  readonly semestres = [
    { value: 'S1', label: 'Semestre 1 — Stage d\'été' },
    { value: 'S2', label: 'Semestre 2 — PFE / PFA' },
  ];

  annees: string[] = [];

  constructor(
    private fb: FormBuilder,
    private stageApi: StageApiService,
    private etablissementApi: EtablissementApiService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.annees = this.buildAnnees();

    this.store.select(selectFilter).pipe(take(1)).subscribe(f => {
      this.buildForm(f.annee, f.semestre);
      this.loadEtablissements();

      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'nouveau') {
        this.isEdit = true;
        this.stageId = +id;
        this.loadStage(this.stageId);
      }
    });
  }

  private buildAnnees(): string[] {
    const now = new Date();
    const start = now.getMonth() >= 8 ? now.getFullYear() - 1 : now.getFullYear() - 2;
    return [start, start + 1, start + 2].map(y => `${y}-${y + 1}`);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  readonly todayIso = new Date().toISOString().substring(0, 10);

  private buildForm(defaultAnnee = '', defaultSemestre = ''): void {
    this.form = this.fb.group({
      titre:             ['', [Validators.required, Validators.maxLength(200)]],
      description:       [''],
      date_debut:        ['', [Validators.required, this.notInPastValidator()]],
      date_fin:          ['', Validators.required],
      statut:            ['brouillon', Validators.required],
      niveau:            [''],
      annee_academique:  [defaultAnnee],
      semestre:          [defaultSemestre],
      etablissement_id:  [null, Validators.required],
      etudiants:         this.fb.array([]),
    }, { validators: [this.dateRangeValidator] });

    // Re-validate date_fin whenever date_debut changes
    this.form.get('date_debut')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.form.get('date_fin')!.updateValueAndValidity({ emitEvent: false }));
  }

  private notInPastValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      // Compare as YYYY-MM-DD strings — avoids timezone drift
      return value < this.todayIso ? { pastDate: true } : null;
    };
  }

  private dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const debut = group.get('date_debut')?.value;
    const fin   = group.get('date_fin')?.value;
    if (!debut || !fin) return null;
    if (fin <= debut) {
      group.get('date_fin')?.setErrors({ ...(group.get('date_fin')?.errors ?? {}), endBeforeStart: true });
      return { endBeforeStart: true };
    }
    // Clear the cross-field error if it was set
    const finCtrl = group.get('date_fin');
    if (finCtrl?.errors) {
      const { endBeforeStart, ...rest } = finCtrl.errors;
      finCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };

  get etudiants(): FormArray {
    return this.form.get('etudiants') as FormArray;
  }

  addEtudiant(): void {
    this.etudiants.push(this.fb.group({
      nom:    ['', [Validators.required, Validators.maxLength(100)]],
      prenom: ['', [Validators.required, Validators.maxLength(100)]],
      email:  ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    }));
  }

  removeEtudiant(index: number): void {
    this.etudiants.removeAt(index);
  }

  private loadEtablissements(): void {
    this.loadingEtablissements = true;
    this.etablissementApi.list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.etablissements = res.data;
          this.loadingEtablissements = false;
        },
        error: () => { this.loadingEtablissements = false; },
      });
  }

  private loadStage(id: number): void {
    this.loading = true;
    this.stageApi.get(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          const s = res.data;
          this.form.patchValue({
            titre:             s.titre,
            description:       s.description ?? '',
            date_debut:        s.date_debut,
            date_fin:          s.date_fin,
            statut:            s.statut,
            niveau:            s.niveau ?? '',
            annee_academique:  s.annee_academique ?? '',
            semestre:          s.semestre ?? '',
            etablissement_id:  s.etablissement?.id ?? null,
          });
          this.loading = false;
        },
        error: err => {
          this.error = err.error?.message ?? 'Erreur de chargement.';
          this.loading = false;
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;

    const { etudiants, ...stageData } = this.form.value;
    const payload: CreateStagePayload = stageData;
    const invitedEtudiants: { nom: string; prenom: string; email: string }[] = etudiants ?? [];

    if (this.isEdit && this.stageId) {
      this.stageApi.update(this.stageId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: res => this.router.navigate(['/stages', res.data.id]),
          error: err => {
            this.error = err.error?.message ?? 'Erreur lors de l\'enregistrement.';
            this.loading = false;
          },
        });
      return;
    }

    this.stageApi.create(payload)
      .pipe(
        switchMap(res => {
          const stageId = res.data.id;
          if (invitedEtudiants.length === 0) {
            return of(stageId);
          }
          return this.stageApi.affecter(stageId, { etudiants: invitedEtudiants })
            .pipe(switchMap(() => of(stageId)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: stageId => this.router.navigate(['/stages', stageId]),
        error: err => {
          this.error = err.error?.message ?? 'Erreur lors de l\'enregistrement.';
          this.loading = false;
        },
      });
  }

  cancel(): void {
    if (this.isEdit && this.stageId) {
      this.router.navigate(['/stages', this.stageId]);
    } else {
      this.router.navigate(['/stages']);
    }
  }
}
