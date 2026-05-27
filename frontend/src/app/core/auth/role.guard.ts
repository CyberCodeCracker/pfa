import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';
import { selectAuthInitialized, selectCurrentUser } from '../../store/auth/auth.selectors';
import { UserRole } from '../models/user.model';

export const roleGuard = (requiredRole: UserRole): CanActivateFn => () => {
  const store  = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthInitialized).pipe(
    filter(initialized => initialized),
    take(1),
    map(() => true)
  ).pipe(
    map(() => true),
  );
};

export function canActivateForRole(role: UserRole): CanActivateFn {
  return () => {
    const store  = inject(Store);
    const router = inject(Router);

    return store.select(selectCurrentUser).pipe(
      filter(user => user !== undefined),
      take(1),
      map(user => {
        if (!user) return router.createUrlTree(['/login']);
        if (user.role !== role) {
          return router.createUrlTree([user.role === 'enseignant' ? '/dashboard' : '/mes-stages']);
        }
        return true;
      })
    );
  };
}
