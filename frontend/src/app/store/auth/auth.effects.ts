import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { EchoService } from '../../core/realtime/echo.service';
import { AuthActions } from './auth.actions';
import { FilterActions } from '../filter/filter.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private echoService: EchoService,
    private router: Router,
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password, remember }) =>
        this.authService.login(email, password, remember).pipe(
          map(res => AuthActions.loginSuccess({ user: res.data })),
          catchError(err => of(AuthActions.loginFailure({ error: err.error?.message ?? 'Erreur de connexion.' })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ user }) => {
        this.echoService.connect();
        if (user.must_change_password) {
          this.router.navigate(['/changer-mot-de-passe']);
        } else {
          this.router.navigate([user.role === 'enseignant' ? '/dashboard' : '/mes-stages']);
        }
      })
    ),
    { dispatch: false }
  );

  loadMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMe),
      exhaustMap(() =>
        this.authService.me().pipe(
          map(res => AuthActions.loadMeSuccess({ user: res.data })),
          catchError(() => of(AuthActions.loadMeFailure()))
        )
      )
    )
  );

  loadMeSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMeSuccess),
      tap(() => this.echoService.connect())
    ),
    { dispatch: false }
  );

  initFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.loadMeSuccess),
      map(({ user }) => FilterActions.initFilter({ user }))
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess()))
        )
      )
    )
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        this.echoService.disconnect();
        this.router.navigate(['/login']);
      })
    ),
    { dispatch: false }
  );
}
