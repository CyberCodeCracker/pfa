import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, take } from 'rxjs';
import { selectAuthInitialized, selectIsAuthenticated } from '../../store/auth/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const store  = inject(Store);

  return store.select(selectAuthInitialized).pipe(
    filter(initialized => initialized),
    take(1),
    map(() => true),
  );
};

export const isAuthenticatedGuard: CanActivateFn = () => {
  const store  = inject(Store);
  const router = inject(Router);

  return combineLatest([
    store.select(selectAuthInitialized),
    store.select(selectIsAuthenticated),
  ]).pipe(
    filter(([initialized]) => initialized),
    take(1),
    map(([, isAuth]) => isAuth || router.createUrlTree(['/login'])),
  );
};
