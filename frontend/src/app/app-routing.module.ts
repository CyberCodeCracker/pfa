import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isAuthenticatedGuard } from './core/auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Unauthenticated routes (auth layout)
  {
    path: '',
    loadChildren: () => import('./layout/auth-layout/auth-layout.module').then(m => m.AuthLayoutModule),
  },

  // Authenticated routes (authenticated layout with sidebar)
  {
    path: '',
    canActivate: [isAuthenticatedGuard],
    loadChildren: () => import('./layout/authenticated-layout/authenticated-layout.module').then(m => m.AuthenticatedLayoutModule),
  },

  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
