import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-force-change-password',
  template: `
    <div class="min-h-screen flex items-center justify-center p-8">
      <div class="w-full max-w-md bg-white rounded-xl shadow p-8">
        <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
          <span class="text-2xl">🔐</span>
        </div>
        <h2 class="text-2xl font-bold mb-2 text-gray-900">Changement de mot de passe requis</h2>
        <p class="text-gray-500 mb-6 text-sm">Pour la sécurité de votre compte, vous devez définir un nouveau mot de passe.</p>
        <p *ngIf="error" class="text-red-600 mb-4 text-sm">{{ error }}</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input type="password" formControlName="current_password"
                   class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe (10 caractères min, majuscule + chiffre)</label>
            <input type="password" formControlName="new_password"
                   class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input type="password" formControlName="new_password_confirmation"
                   class="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <button type="submit" [disabled]="form.invalid || loading"
                  class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {{ loading ? 'Enregistrement...' : 'Enregistrer le mot de passe' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class ForceChangePasswordComponent {
  form = this.fb.group({
    current_password:          ['', Validators.required],
    new_password:              ['', [Validators.required, Validators.minLength(10)]],
    new_password_confirmation: ['', Validators.required],
  });
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private store: Store) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { current_password, new_password, new_password_confirmation } = this.form.value;
    this.authService.changePassword(current_password!, new_password!, new_password_confirmation!).subscribe({
      next: () => this.store.dispatch(AuthActions.loadMe()),
      error: err => {
        this.error = err.error?.message ?? 'Erreur.';
        this.loading = false;
      },
    });
  }
}
