import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ToastService } from '../../../shared/toast/toast.service';
import { StageApiService, CreateStagePayload } from '../../../core/services/stage-api.service';
import { EtablissementApiService } from '../../../core/services/etablissement-api.service';
import { Etablissement } from '../../../core/models/etablissement.model';
import { Stage } from '../../../core/models/stage.model';
import { selectFilter } from '../../../store/filter/filter.selectors';
import { BreadcrumbItem } from '../../../shared/breadcrumbs/breadcrumbs.component';

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
    { value: 'actif',    label: 'Actif' },
    { value: 'suspendu', label: 'Suspendu' },
    { value: 'terminé',  label: 'Terminé' },
  ];

  private readonly FINAL_LEVELS = ['Licence 3', 'Master 2', 'Ingénierie 3'];
  private readonly NON_FINAL_LEVELS = ['Licence 1', 'Licence 2', 'Master 1', 'Ingénierie 1', 'Ingénierie 2'];

  readonly niveaux = [
    'Licence 1',
    'Licence 2',
    'Licence 3',
    'Master 1',
    'Master 2',
    'Ingénierie 1',
    'Ingénierie 2',
    'Ingénierie 3',
  ];

  readonly typesStage = [
    { value: 'ete', label: 'Stage d\'été' },
    { value: 'pfe', label: 'PFE — Projet de Fin d\'Études' },
    { value: 'pfa', label: 'PFA — Projet de Fin d\'Année' },
  ];

  get filteredNiveaux(): string[] {
    const semestre = this.form?.get('semestre')?.value;
    if (semestre === 'pfe') return this.FINAL_LEVELS;
    if (semestre === 'ete' || semestre === 'pfa') return this.NON_FINAL_LEVELS;
    return this.niveaux;
  }

  get filteredTypesStage(): { value: string; label: string }[] {
    const niveau = this.form?.get('niveau')?.value;
    if (this.FINAL_LEVELS.includes(niveau)) return this.typesStage.filter(t => t.value === 'pfe');
    if (this.NON_FINAL_LEVELS.includes(niveau)) return this.typesStage.filter(t => t.value !== 'pfe');
    return this.typesStage;
  }

  /** Auto-computed once on init — not editable by the user */
  currentAnnee = '';

  get breadcrumbs(): BreadcrumbItem[] {
    if (!this.isEdit) {
      return [{ label: 'Stages', link: '/stages' }, { label: 'Nouveau stage' }];
    }
    const items: BreadcrumbItem[] = [{ label: 'Stages', link: '/stages' }];
    const titre = this.form?.get('titre')?.value;
    if (this.stageId) items.push({ label: titre || `Stage #${this.stageId}`, link: ['/stages', this.stageId] });
    items.push({ label: 'Modifier' });
    return items;
  }

  constructor(
    private fb: FormBuilder,
    private stageApi: StageApiService,
    private etablissementApi: EtablissementApiService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.currentAnnee = this.computeCurrentAcademicYear();

    this.store.select(selectFilter).pipe(take(1)).subscribe(f => {
      this.buildForm(this.currentAnnee, f.semestre);
      this.loadEtablissements();

      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'nouveau') {
        this.isEdit = true;
        this.stageId = +id;
        this.loadStage(this.stageId);
      }
    });
  }

  private computeCurrentAcademicYear(): string {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  readonly todayIso = new Date().toISOString().substring(0, 10);

  private buildForm(defaultAnnee = '', defaultSemestre = ''): void {
    this.form = this.fb.group({
      titre:             ['', [Validators.required, Validators.maxLength(200)]],
      description:       ['', Validators.required],
      date_debut:        ['', [Validators.required, this.notInPastValidator()]],
      date_fin:          ['', Validators.required],
      statut:            ['brouillon', Validators.required],
      niveau:            ['', Validators.required],
      annee_academique:  [defaultAnnee],
      semestre:          [defaultSemestre, Validators.required],
      etablissement_id:  [null, Validators.required],
      etudiants:         this.fb.array([]),
    }, { validators: [this.dateRangeValidator] });

    // Re-validate date_fin whenever date_debut changes
    this.form.get('date_debut')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.form.get('date_fin')!.updateValueAndValidity({ emitEvent: false }));

    // When niveau changes, auto-set semestre for final levels; clear incompatible semestre
    this.form.get('niveau')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(niveau => {
        if (this.FINAL_LEVELS.includes(niveau)) {
          this.form.get('semestre')!.setValue('pfe', { emitEvent: false });
        } else if (this.NON_FINAL_LEVELS.includes(niveau)) {
          if (this.form.get('semestre')?.value === 'pfe') {
            this.form.get('semestre')!.setValue('', { emitEvent: false });
          }
        }
      });

    // When semestre changes, clear niveau if it's incompatible with the new type
    this.form.get('semestre')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(semestre => {
        const niveau = this.form.get('niveau')?.value;
        if ((semestre === 'ete' || semestre === 'pfa') && this.FINAL_LEVELS.includes(niveau)) {
          this.form.get('niveau')!.setValue('', { emitEvent: false });
        } else if (semestre === 'pfe' && this.NON_FINAL_LEVELS.includes(niveau)) {
          this.form.get('niveau')!.setValue('', { emitEvent: false });
        }
      });
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
          next: res => {
            this.toast.success('Stage mis à jour.');
            this.router.navigate(['/stages', res.data.id]);
          },
          error: err => {
            this.error = err.error?.message ?? 'Erreur lors de l\'enregistrement.';
            this.toast.error(this.error!);
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
        next: stageId => {
          this.toast.success(
            invitedEtudiants.length > 0
              ? `Stage créé et ${invitedEtudiants.length} étudiant(s) invité(s).`
              : 'Stage créé avec succès.'
          );
          this.router.navigate(['/stages', stageId]);
        },
        error: err => {
          this.error = err.error?.message ?? 'Erreur lors de l\'enregistrement.';
          this.toast.error(this.error!);
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
