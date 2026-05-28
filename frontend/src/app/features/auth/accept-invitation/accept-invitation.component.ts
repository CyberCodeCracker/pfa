import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-accept-invitation',
  templateUrl: './accept-invitation.component.html',
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
        this.error = err.error?.message ?? "Erreur lors de l'activation.";
        this.loading = false;
      },
    });
  }
}
