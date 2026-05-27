import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StageApiService, CreateStagePayload } from '../../../core/services/stage-api.service';
import { EtablissementApiService } from '../../../core/services/etablissement-api.service';
import { Etablissement } from '../../../core/models/etablissement.model';
import { Stage } from '../../../core/models/stage.model';

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

  constructor(
    private fb: FormBuilder,
    private stageApi: StageApiService,
    private etablissementApi: EtablissementApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadEtablissements();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nouveau') {
      this.isEdit = true;
      this.stageId = +id;
      this.loadStage(this.stageId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      titre:            ['', [Validators.required, Validators.maxLength(200)]],
      description:      [''],
      date_debut:       ['', Validators.required],
      date_fin:         ['', Validators.required],
      statut:           ['brouillon', Validators.required],
      niveau:           [''],
      etablissement_id: [null, Validators.required],
    });
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
            titre:            s.titre,
            description:      s.description ?? '',
            date_debut:       s.date_debut,
            date_fin:         s.date_fin,
            statut:           s.statut,
            niveau:           s.niveau ?? '',
            etablissement_id: s.etablissement?.id ?? null,
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

    const payload: CreateStagePayload = this.form.value;

    const request$ = this.isEdit && this.stageId
      ? this.stageApi.update(this.stageId, payload)
      : this.stageApi.create(payload);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.router.navigate(['/stages', res.data.id]);
      },
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
