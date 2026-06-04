import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { StageApiService } from '../../../core/services/stage-api.service';
import { Stage } from '../../../core/models/stage.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { MeetingCreateDialogComponent } from '../meeting-create-dialog/meeting-create-dialog.component';

@Component({
  selector: 'app-stage-detail',
  templateUrl: './stage-detail.component.html',
  styleUrls: ['./stage-detail.component.scss'],
})
export class StageDetailComponent implements OnInit, OnDestroy {
  stage: Stage | null = null;
  loading = true;
  error: string | null = null;
  selectedTabIndex = 0;
  private destroy$ = new Subject<void>();

  currentUser$ = this.store.select(selectCurrentUser);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stageApi: StageApiService,
    private store: Store,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(id: number): void {
    this.loading = true;
    this.stageApi.get(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => { this.stage = res.data; this.loading = false; },
      error: err => { this.error = err.error?.message ?? 'Erreur de chargement.'; this.loading = false; },
    });
  }

  goBack(): void {
    this.router.navigate(['/stages']);
  }

  editStage(): void {
    this.router.navigate(['/stages', this.stage?.id, 'modifier']);
  }

  openCreateMeeting(): void {
    if (!this.stage) return;
    const ref = this.dialog.open(MeetingCreateDialogComponent, {
      width: '560px',
      disableClose: false,
      data: { stageId: this.stage.id },
    });
    ref.afterClosed().subscribe(reunion => {
      if (reunion) {
        this.selectedTabIndex = 4;
      }
    });
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      brouillon: 'status-draft',
      actif: 'status-active',
      archivé: 'status-archived',
      terminé: 'status-done',
    };
    return map[statut] ?? '';
  }

  getDaysRemaining(): number | null {
    if (!this.stage) return null;
    return Math.ceil((new Date(this.stage.date_fin).getTime() - Date.now()) / 86400000);
  }
}
