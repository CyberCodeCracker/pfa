import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { StageApiService } from '../../../core/services/stage-api.service';
import { Stage, StageStatut, PaceIndicator } from '../../../core/models/stage.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { MeetingCreateDialogComponent } from '../meeting-create-dialog/meeting-create-dialog.component';
import { ToastService } from '../../../shared/toast/toast.service';

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

  readonly statutOptions: { value: StageStatut; label: string }[] = [
    { value: 'actif',     label: 'Actif' },
    { value: 'suspendu',  label: 'Suspendu' },
    { value: 'terminé',   label: 'Terminé' },
  ];

  readonly paceOptions: { value: PaceIndicator | ''; label: string }[] = [
    { value: '',         label: '— Non évalué —' },
    { value: 'ahead',    label: 'En avance' },
    { value: 'on_track', label: 'À l\'heure' },
    { value: 'behind',   label: 'En retard' },
    { value: 'at_risk',  label: 'En difficulté' },
  ];

  changingStatut = false;
  changingPace = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stageApi: StageApiService,
    private store: Store,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab !== null) this.selectedTabIndex = +tab;
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

  onStatutChange(newStatut: StageStatut): void {
    if (!this.stage || newStatut === this.stage.statut) return;
    this.changingStatut = true;
    this.stageApi.update(this.stage.id, { statut: newStatut })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.stage = res.data;
          this.changingStatut = false;
          this.toast.success(`Statut changé : ${newStatut}.`);
        },
        error: err => {
          this.changingStatut = false;
          this.toast.error(err.error?.message ?? 'Échec du changement de statut.');
        },
      });
  }

  onPaceChange(newPace: PaceIndicator | ''): void {
    if (!this.stage) return;
    this.changingPace = true;
    this.stageApi.update(this.stage.id, { pace_indicator: newPace || null } as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.stage = res.data;
          this.changingPace = false;
          this.toast.success('Évaluation du rythme mise à jour.');
        },
        error: err => {
          this.changingPace = false;
          this.toast.error(err.error?.message ?? 'Échec de la mise à jour.');
        },
      });
  }
}
