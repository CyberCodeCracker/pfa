import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private store: Store) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Don't hijack bootstrap auth probes — auth.effects + guards handle those.
        const isAuthProbe = req.url.endsWith('/api/v1/me')
                         || req.url.endsWith('/sanctum/csrf-cookie');

        if (error.status === 401 && !isAuthProbe) {
          this.store.dispatch(AuthActions.clearUser());
          this.router.navigate(['/login']);
        }

        if (error.status === 403 && error.error?.code === 'PASSWORD_CHANGE_REQUIRED') {
          this.router.navigate(['/changer-mot-de-passe']);
        }

        return throwError(() => error);
      })
    );
  }
}
