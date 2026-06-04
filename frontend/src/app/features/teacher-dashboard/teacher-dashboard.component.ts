import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { StageApiService, StageFilters } from '../../core/services/stage-api.service';
import { Stage } from '../../core/models/stage.model';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { selectFilter } from '../../store/filter/filter.selectors';
import { FilterState } from '../../store/filter/filter.reducer';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss'],
})
export class TeacherDashboardComponent implements OnInit, OnDestroy {
  user$ = this.store.select(selectCurrentUser);
  recentStages: Stage[] = [];
  stagesActifs = 0;
  stagesBrouillon = 0;
  totalEtudiants = 0;
  loading = true;
  filter: FilterState = { annee: '', semestre: '', etablissementId: null };
  private destroy$ = new Subject<void>();

  constructor(
    private stageApi: StageApiService,
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.store.select(selectFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(f => {
        this.filter = { ...f };
        this.loadStats();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private sessionFilters(): Partial<StageFilters> {
    const f = this.filter;
    return {
      ...(f.annee && { 'filter[annee_academique]': f.annee }),
      ...(f.semestre && { 'filter[semestre]': f.semestre }),
      ...(f.etablissementId && { 'filter[etablissement_id]': f.etablissementId }),
    };
  }

  private loadStats(): void {
    this.loading = true;
    this.stageApi.list({ per_page: 5, sort: '-created_at', ...this.sessionFilters() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.recentStages = res.data;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });

    this.stageApi.list({ 'filter[statut]': 'actif', per_page: 1, ...this.sessionFilters() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: res => { this.stagesActifs = res.meta.total; } });

    this.stageApi.list({ 'filter[statut]': 'brouillon', per_page: 1, ...this.sessionFilters() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: res => { this.stagesBrouillon = res.meta.total; } });
  }

  goToStage(id: number): void {
    this.router.navigate(['/stages', id]);
  }

  createStage(): void {
    this.router.navigate(['/stages', 'nouveau']);
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      brouillon: 'chip-draft',
      actif: 'chip-active',
      archivé: 'chip-archived',
      terminé: 'chip-done',
    };
    return map[statut] ?? '';
  }
}
