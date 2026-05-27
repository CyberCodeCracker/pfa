import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { StageApiService } from '../../core/services/stage-api.service';
import { Stage } from '../../core/models/stage.model';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  user$ = this.store.select(selectCurrentUser);
  stages: Stage[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private stageApi: StageApiService,
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.stageApi.list({ per_page: 20 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => { this.stages = res.data; this.loading = false; },
        error: () => { this.loading = false; },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToStage(id: number): void {
    this.router.navigate(['/stages', id]);
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

  getDaysRemaining(dateFin: string): number {
    return Math.ceil((new Date(dateFin).getTime() - Date.now()) / 86400000);
  }
}
