import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { StageApiService, StageFilters } from '../../../core/services/stage-api.service';
import { Stage, StageStatut } from '../../../core/models/stage.model';
import { selectFilter } from '../../../store/filter/filter.selectors';
import { FilterState } from '../../../store/filter/filter.reducer';

interface StageListState {
  stages: Stage[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  lastPage: number;
  total: number;
  search: string;
  filterStatut: string;
}

@Component({
  selector: 'app-stage-list',
  templateUrl: './stage-list.component.html',
  styleUrls: ['./stage-list.component.scss'],
})
export class StageListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stages: Stage[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  lastPage = 1;
  total = 0;
  search = '';
  filterStatut = '';
  private sessionFilter: FilterState = { annee: '', semestre: '', etablissementId: null };

  readonly statuts: { value: string; label: string }[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'actif',    label: 'Actif' },
    { value: 'suspendu', label: 'Suspendu' },
    { value: 'terminé',  label: 'Terminé' },
  ];

  constructor(
    private stageApi: StageApiService,
    private router: Router,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.store.select(selectFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(f => {
        this.sessionFilter = f;
        this.currentPage = 1;
        this.load();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    const f = this.sessionFilter;
    const filters: StageFilters = {
      page: this.currentPage,
      per_page: 6,
      ...(this.search && { search: this.search }),
      ...(this.filterStatut && { 'filter[statut]': this.filterStatut }),
      ...(f.annee && { 'filter[annee_academique]': f.annee }),
      ...(f.semestre && { 'filter[semestre]': f.semestre }),
      ...(f.etablissementId && { 'filter[etablissement_id]': f.etablissementId }),
    };

    this.stageApi.list(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.stages = res.data;
          this.currentPage = res.meta.current_page;
          this.lastPage = res.meta.last_page;
          this.total = res.meta.total;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Erreur lors du chargement des stages.';
          this.loading = false;
        },
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.load();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.currentPage = page;
    this.load();
  }

  get visiblePages(): (number | '…')[] {
    const last = this.lastPage;
    const cur  = this.currentPage;
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

    const pages: (number | '…')[] = [1];
    const start = Math.max(2, cur - 1);
    const end   = Math.min(last - 1, cur + 1);
    if (start > 2) pages.push('…');
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < last - 1) pages.push('…');
    pages.push(last);
    return pages;
  }

  viewStage(id: number): void {
    this.router.navigate(['/stages', id]);
  }

  editStage(event: Event, id: number): void {
    event.stopPropagation();
    this.router.navigate(['/stages', id, 'modifier']);
  }

  createStage(): void {
    this.router.navigate(['/stages', 'nouveau']);
  }

  trackById(_: number, item: Stage): number {
    return item.id;
  }
}
