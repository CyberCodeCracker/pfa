import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReunionApiService } from '../../core/services/reunion-api.service';
import { Reunion } from '../../core/models/reunion.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.scss'],
})
export class MeetingsComponent implements OnInit, OnDestroy {
  reunions: Reunion[] = [];
  upcoming: Reunion[] = [];
  past: Reunion[] = [];
  loading = true;
  selectedTabIndex = 0;
  user$ = this.store.select(selectCurrentUser);
  private destroy$ = new Subject<void>();

  constructor(
    private reunionApi: ReunionApiService,
    private store: Store,
    private route: ActivatedRoute,
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
    this.reunionApi.list({ per_page: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          const now = new Date();
          this.reunions = res.data;
          this.upcoming = res.data.filter(r => new Date(r.scheduled_at) >= now && r.statut !== 'annulée');
          this.past     = res.data.filter(r => new Date(r.scheduled_at) < now || r.statut === 'annulée');
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  getStatutClass(statut: string): string {
    const m: Record<string, string> = {
      planifiée: 'chip-planned',
      terminée: 'chip-done',
      annulée: 'chip-cancelled',
    };
    return m[statut] ?? '';
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }
}
