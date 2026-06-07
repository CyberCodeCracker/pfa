import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FeedbackApiService, Feedback } from '../../../core/services/feedback-api.service';
import { Affectation } from '../../../core/models/stage.model';
import { StageApiService } from '../../../core/services/stage-api.service';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-stage-feedback',
  templateUrl: './stage-feedback.component.html',
  styleUrls: ['./stage-feedback.component.scss'],
})
export class StageFeedbackComponent implements OnInit, OnDestroy {
  @Input() stageId!: number;
  @Input() isArchived = false;

  feedbacks: Feedback[] = [];
  students: User[] = [];
  loading = false;
  isEnseignant = false;
  showForm = false;
  submitting = false;
  formError: string | null = null;
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private feedbackApi: FeedbackApiService,
    private stageApi: StageApiService,
    private store: Store,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      etudiant_id: [null, Validators.required],
      contenu:     ['', [Validators.required, Validators.minLength(20), Validators.maxLength(3000)]],
      note:        [null],
    });

    this.store.select(selectCurrentUser).pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.isEnseignant = u?.role === 'enseignant';
    });

    this.loadFeedbacks();
    this.loadStudents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFeedbacks(): void {
    this.loading = true;
    this.feedbackApi.list(this.stageId).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => { this.feedbacks = res.data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  private loadStudents(): void {
    this.stageApi.get(this.stageId).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.students = (res.data.affectations ?? [])
          .filter((a: Affectation) => a.statut === 'actif' && a.etudiant)
          .map((a: Affectation) => a.etudiant!);
      },
    });
  }

  submitFeedback(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.formError = null;

    const { etudiant_id, contenu, note } = this.form.value;
    this.feedbackApi.create(this.stageId, {
      etudiant_id,
      contenu,
      note: note || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.feedbacks = [res.data, ...this.feedbacks];
        this.form.reset();
        this.showForm = false;
        this.submitting = false;
      },
      error: err => {
        this.formError = err.error?.message ?? 'Erreur.';
        this.submitting = false;
      },
    });
  }

  getInitials(user?: { prenom: string; nom: string }): string {
    if (!user) return '?';
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
  }
}
