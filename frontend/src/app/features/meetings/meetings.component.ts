import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReunionApiService } from '../../core/services/reunion-api.service';
import { Reunion } from '../../core/models/reunion.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { selectFilter } from '../../store/filter/filter.selectors';
import { FilterState } from '../../store/filter/filter.reducer';

export interface CalendarCell {
  day: number | null;
  meetings: Reunion[];
}

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.scss'],
})
export class MeetingsComponent implements OnInit, OnDestroy {
  reunions: Reunion[] = [];
  past: Reunion[] = [];
  loading = true;
  selectedTabIndex = 0;
  isEnseignant = false;
  user$ = this.store.select(selectCurrentUser);

  viewDate: Date = new Date();

  readonly weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  readonly monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  get years(): number[] {
    const cur = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => cur - 2 + i);
  }

  get selectedMonth(): number { return this.viewDate.getMonth(); }
  get selectedYear(): number  { return this.viewDate.getFullYear(); }

  setMonth(month: number): void {
    const d = new Date(this.viewDate);
    d.setMonth(+month);
    this.viewDate = d;
  }

  setYear(year: number): void {
    const d = new Date(this.viewDate);
    d.setFullYear(+year);
    this.viewDate = d;
  }

  // Palette of full class strings — written out fully so Tailwind includes them
  private readonly etabPalette = [
    'bg-tertiary-container text-on-tertiary-container',
    'bg-secondary-container text-on-secondary-container',
    'bg-primary-container text-on-primary-container',
    'bg-error-container text-on-error-container',
    'bg-surface-container-high text-on-surface',
  ];

  // Stable mapping from etablissement id → palette index
  private etabColorIndex = new Map<number, number>();
  private nextColorSlot = 0;

  private filter: FilterState = { annee: '', semestre: '', etablissementId: null };
  private destroy$ = new Subject<void>();

  constructor(
    private reunionApi: ReunionApiService,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => { this.isEnseignant = u?.role === 'enseignant'; });

    this.store.select(selectFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(f => {
        this.filter = f;
        this.load();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.etabColorIndex.clear();
    this.nextColorSlot = 0;
    const f = this.filter;
    this.reunionApi.list({
      per_page: 100,
      ...(f.annee && { annee_academique: f.annee }),
      ...(f.semestre && { semestre: f.semestre }),
      ...(f.etablissementId && { etablissement_id: f.etablissementId }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          const now = new Date();
          this.reunions = res.data;
          this.past = res.data.filter(r => new Date(r.scheduled_at) < now || r.statut === 'annulée');
          // Pre-assign colors in chronological order for stable assignment
          res.data.forEach(r => this.resolveEtabColor(r));
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  private resolveEtabColor(r: Reunion): void {
    const id = r.stage?.etablissement?.id;
    if (id != null && !this.etabColorIndex.has(id)) {
      this.etabColorIndex.set(id, this.nextColorSlot % this.etabPalette.length);
      this.nextColorSlot++;
    }
  }

  chipClasses(r: Reunion): string {
    if (r.statut === 'annulée') return 'bg-error-container text-on-error-container opacity-60';
    if (this.isPast(r))         return 'bg-surface-container text-on-surface-variant opacity-60';
    if (this.isEnseignant) {
      const id = r.stage?.etablissement?.id;
      const idx = id != null ? (this.etabColorIndex.get(id) ?? 0) : 0;
      return this.etabPalette[idx];
    }
    return 'bg-tertiary-container text-on-tertiary-container';
  }

  goToStage(r: Reunion): void {
    if (r.stage?.id) {
      this.router.navigate(['/stages', r.stage.id]);
    }
  }

  get calendarMonthLabel(): string {
    return this.viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  get calendarGrid(): CalendarCell[] {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const offset = (firstDow + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: CalendarCell[] = [];

    for (let i = 0; i < offset; i++) {
      cells.push({ day: null, meetings: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const meetings = this.reunions
        .filter(r => {
          const rd = new Date(r.scheduled_at);
          return rd.getFullYear() === year && rd.getMonth() === month && rd.getDate() === d;
        })
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
      cells.push({ day: d, meetings });
    }

    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        cells.push({ day: null, meetings: [] });
      }
    }

    return cells;
  }

  get upcomingCount(): number {
    const now = new Date();
    return this.reunions.filter(r => new Date(r.scheduled_at) >= now && r.statut !== 'annulée').length;
  }

  get etabLegend(): Array<{ nom: string; classes: string }> {
    if (!this.isEnseignant) return [];
    const seen = new Map<number, { nom: string; classes: string }>();
    this.reunions.forEach(r => {
      const etab = r.stage?.etablissement;
      if (etab && !seen.has(etab.id)) {
        const idx = this.etabColorIndex.get(etab.id) ?? 0;
        seen.set(etab.id, { nom: etab.nom, classes: this.etabPalette[idx] });
      }
    });
    return Array.from(seen.values());
  }

  isToday(day: number): boolean {
    const t = new Date();
    return (
      t.getFullYear() === this.viewDate.getFullYear() &&
      t.getMonth() === this.viewDate.getMonth() &&
      t.getDate() === day
    );
  }

  isPast(r: Reunion): boolean {
    return new Date(r.scheduled_at) < new Date();
  }

  prevMonth(): void {
    const d = new Date(this.viewDate);
    d.setMonth(d.getMonth() - 1);
    this.viewDate = d;
  }

  nextMonth(): void {
    const d = new Date(this.viewDate);
    d.setMonth(d.getMonth() + 1);
    this.viewDate = d;
  }

  goToToday(): void {
    this.viewDate = new Date();
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }
}
