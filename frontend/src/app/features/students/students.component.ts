import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { StageApiService } from '../../core/services/stage-api.service';
import { Stage } from '../../core/models/stage.model';
import { User } from '../../core/models/user.model';
import { Router } from '@angular/router';

interface StudentRow {
  user: User;
  stage: Stage;
  statut: string;
}

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
})
export class StudentsComponent implements OnInit, OnDestroy {
  rows: StudentRow[] = [];
  loading = true;
  search = '';
  private destroy$ = new Subject<void>();
  private allRows: StudentRow[] = [];

  constructor(private stageApi: StageApiService, private router: Router) {}

  ngOnInit(): void {
    this.stageApi.list({ per_page: 100, 'filter[statut]': 'actif' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.allRows = [];
          res.data.forEach(stage => {
            (stage.affectations ?? []).forEach(a => {
              if (a.etudiant) {
                this.allRows.push({ user: a.etudiant, stage, statut: a.statut });
              }
            });
          });
          this.rows = [...this.allRows];
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    const q = this.search.toLowerCase();
    this.rows = q
      ? this.allRows.filter(r =>
          r.user.nom.toLowerCase().includes(q) ||
          r.user.prenom.toLowerCase().includes(q) ||
          r.user.email.toLowerCase().includes(q) ||
          r.stage.titre.toLowerCase().includes(q)
        )
      : [...this.allRows];
  }

  goToStage(id: number): void {
    this.router.navigate(['/stages', id]);
  }

  getChipClass(statut: string): string {
    const m: Record<string, string> = { invité: 'chip-invited', actif: 'chip-active', retiré: 'chip-removed' };
    return m[statut] ?? '';
  }
}
