import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-force-change-password',
  templateUrl: './force-change-password.component.html',
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
