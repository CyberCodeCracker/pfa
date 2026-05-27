import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { StageApiService } from '../../core/services/stage-api.service';
import { Stage } from '../../core/models/stage.model';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

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
  private destroy$ = new Subject<void>();

  constructor(
    private stageApi: StageApiService,
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStats(): void {
    this.stageApi.list({ per_page: 5, sort: '-created_at' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.recentStages = res.data;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });

    this.stageApi.list({ 'filter[statut]': 'actif', per_page: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: res => { this.stagesActifs = res.meta.total; } });

    this.stageApi.list({ 'filter[statut]': 'brouillon', per_page: 1 })
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
