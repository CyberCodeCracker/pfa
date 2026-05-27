import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-accept-invitation',
  template: `
    <div class="min-h-screen flex items-center justify-center p-8">
      <div class="w-full max-w-md bg-white rounded-xl shadow p-8">
        <h2 class="text-2xl font-bold mb-2 text-gray-900">Accepter l'invitation</h2>
        <p class="text-gray-500 mb-6">Définissez votre mot de passe pour accéder à votre espace.</p>
        <p *ngIf="error" class="text-red-600 mb-4 text-sm">{{ error }}</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input type="password" formControlName="password"
                   class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input type="password" formControlName="password_confirmation"
                   class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" [disabled]="form.invalid || loading"
                  class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {{ loading ? 'Activation...' : 'Activer mon compte' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AcceptInvitationComponent implements OnInit {
  form!: FormGroup;
  token = '';
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.form = this.fb.group({
      password:              ['', [Validators.required, Validators.minLength(10)]],
      password_confirmation: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { password, password_confirmation } = this.form.value;
    this.authService.acceptInvitation(this.token, password, password_confirmation).subscribe({
      next: res => {
        this.store.dispatch(AuthActions.loginSuccess({ user: res.data }));
      },
      error: err => {
        this.error = err.error?.message ?? 'Erreur lors de l\'activation.';
        this.loading = false;
      },
    });
  }
}
