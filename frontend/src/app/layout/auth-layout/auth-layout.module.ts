import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadChildren: () => import('../../features/auth/login-page/login-page.module').then(m => m.LoginPageModule),
      },
      {
        path: 'accepter-invitation/:token',
        loadChildren: () => import('../../features/auth/accept-invitation/accept-invitation.module').then(m => m.AcceptInvitationModule),
      },
      {
        path: 'mot-de-passe-oublie',
        loadChildren: () => import('../../features/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule),
      },
    ],
  },
];

@NgModule({
  declarations: [AuthLayoutComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class AuthLayoutModule {}
