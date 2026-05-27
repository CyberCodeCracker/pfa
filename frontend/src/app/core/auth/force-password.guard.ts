import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

export const forcePasswordGuard: CanActivateFn = () => {
  const store  = inject(Store);
  const router = inject(Router);

  return store.select(selectCurrentUser).pipe(
    filter(user => user !== null && user !== undefined),
    take(1),
    map(user => {
      if (!user) return router.createUrlTree(['/login']);
      if (!user.must_change_password) {
        return router.createUrlTree([user.role === 'enseignant' ? '/dashboard' : '/mes-stages']);
      }
      return true;
    })
  );
};
