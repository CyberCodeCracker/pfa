import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, Subject, takeUntil, tap, switchMap, catchError, of } from 'rxjs';
import { StageApiService, StageFilters } from '../../../core/services/stage-api.service';
import { Stage, StageStatut } from '../../../core/models/stage.model';
import { PaginatedResponse } from '../../../core/models/api.model';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

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

  readonly statuts: { value: string; label: string }[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'actif', label: 'Actif' },
    { value: 'archivé', label: 'Archivé' },
    { value: 'terminé', label: 'Terminé' },
  ];

  constructor(
    private stageApi: StageApiService,
    private router: Router,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    const filters: StageFilters = {
      page: this.currentPage,
      per_page: 12,
    };
    if (this.search) filters['search'] = this.search;
    if (this.filterStatut) filters['filter[statut]'] = this.filterStatut;

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

  getStatutClass(statut: StageStatut): string {
    const map: Record<StageStatut, string> = {
      brouillon: 'status-draft',
      actif: 'status-active',
      archivé: 'status-archived',
      terminé: 'status-done',
    };
    return map[statut] ?? '';
  }

  getStatutLabel(statut: StageStatut): string {
    const map: Record<StageStatut, string> = {
      brouillon: 'Brouillon',
      actif: 'Actif',
      archivé: 'Archivé',
      terminé: 'Terminé',
    };
    return map[statut] ?? statut;
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
