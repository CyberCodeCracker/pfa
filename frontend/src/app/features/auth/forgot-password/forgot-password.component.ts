import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="min-h-screen flex items-center justify-center p-8">
      <div class="w-full max-w-md bg-white rounded-xl shadow p-8">
        <h2 class="text-2xl font-bold mb-6 text-gray-900">Mot de passe oublié</h2>
        <p *ngIf="sent" class="text-green-600 text-sm mb-4">
          Si cet email existe, un lien de réinitialisation a été envoyé.
        </p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <input type="email" formControlName="email" placeholder="votre@email.tn"
                 class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" [disabled]="form.invalid"
                  class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            Envoyer le lien
          </button>
        </form>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  sent = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.authService.forgotPassword(this.form.value.email!).subscribe(() => (this.sent = true));
  }
}
