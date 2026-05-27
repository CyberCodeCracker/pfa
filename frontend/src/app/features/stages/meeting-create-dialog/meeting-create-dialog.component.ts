import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ReunionApiService } from '../../../core/services/reunion-api.service';
import { StageApiService } from '../../../core/services/stage-api.service';
import { Reunion } from '../../../core/models/reunion.model';
import { Affectation } from '../../../core/models/stage.model';
import { User } from '../../../core/models/user.model';

export interface MeetingDialogData {
  stageId: number;
}

@Component({
  selector: 'app-meeting-create-dialog',
  templateUrl: './meeting-create-dialog.component.html',
})
export class MeetingCreateDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  loadingStudents = false;
  error: string | null = null;
  students: User[] = [];
  selectedParticipantIds: number[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reunionApi: ReunionApiService,
    private stageApi: StageApiService,
    private dialogRef: MatDialogRef<MeetingCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MeetingDialogData,
  ) {}

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    this.form = this.fb.group({
      sujet:            ['', [Validators.required, Validators.maxLength(200)]],
      description:      [''],
      scheduled_at:     [tomorrow.toISOString().slice(0, 16), Validators.required],
      duration_minutes: [60, [Validators.required, Validators.min(15), Validators.max(480)]],
      meet_url:         [''],
    });

    this.loadStudents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStudents(): void {
    this.loadingStudents = true;
    this.stageApi.get(this.data.stageId).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.students = (res.data.affectations ?? [])
          .filter((a: Affectation) => a.statut === 'actif' && a.etudiant)
          .map((a: Affectation) => a.etudiant!);
        this.selectedParticipantIds = this.students.map(s => s.id);
        this.loadingStudents = false;
      },
      error: () => { this.loadingStudents = false; },
    });
  }

  toggleParticipant(userId: number): void {
    const idx = this.selectedParticipantIds.indexOf(userId);
    if (idx >= 0) {
      this.selectedParticipantIds = this.selectedParticipantIds.filter(id => id !== userId);
    } else {
      this.selectedParticipantIds = [...this.selectedParticipantIds, userId];
    }
  }

  isSelected(userId: number): boolean {
    return this.selectedParticipantIds.includes(userId);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;

    const { sujet, description, scheduled_at, duration_minutes, meet_url } = this.form.value;

    this.reunionApi.create(this.data.stageId, {
      sujet,
      description: description || undefined,
      scheduled_at,
      duration_minutes,
      meet_url: meet_url || undefined,
      participant_ids: this.selectedParticipantIds,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.dialogRef.close(res.data);
      },
      error: err => {
        this.error = err.error?.message ?? 'Erreur lors de la création.';
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
