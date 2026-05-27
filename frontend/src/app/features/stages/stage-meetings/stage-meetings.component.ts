import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ReunionApiService } from '../../../core/services/reunion-api.service';
import { Reunion } from '../../../core/models/reunion.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { MeetingCreateDialogComponent } from '../meeting-create-dialog/meeting-create-dialog.component';

@Component({
  selector: 'app-stage-meetings',
  templateUrl: './stage-meetings.component.html',
  styleUrls: ['./stage-meetings.component.scss'],
})
export class StageMeetingsComponent implements OnInit, OnDestroy {
  @Input() stageId!: number;

  reunions: Reunion[] = [];
  loading = false;
  isEnseignant = false;
  private destroy$ = new Subject<void>();

  constructor(
    private reunionApi: ReunionApiService,
    private store: Store,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.store.select(selectCurrentUser).pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.isEnseignant = u?.role === 'enseignant';
    });
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.reunionApi.list({ per_page: 50 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.reunions = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(MeetingCreateDialogComponent, {
      width: '560px',
      data: { stageId: this.stageId },
    });
    ref.afterClosed().subscribe(reunion => {
      if (reunion) this.reunions = [reunion, ...this.reunions];
    });
  }

  annuler(reunion: Reunion): void {
    this.reunionApi.annuler(reunion.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.reunions = this.reunions.map(r => r.id === res.data.id ? res.data : r);
      },
    });
  }

  getStatutClass(statut: string): string {
    return statut === 'planifiée' ? 'chip-planned' : statut === 'terminée' ? 'chip-done' : 'chip-cancelled';
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }
}
