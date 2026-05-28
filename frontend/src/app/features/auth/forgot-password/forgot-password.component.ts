import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
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
