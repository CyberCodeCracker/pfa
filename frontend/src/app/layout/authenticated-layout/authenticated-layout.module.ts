import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticatedLayoutComponent } from './authenticated-layout.component';
import { canActivateForRole } from '../../core/auth/role.guard';
import { forcePasswordGuard } from '../../core/auth/force-password.guard';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'changer-mot-de-passe',
        canActivate: [forcePasswordGuard],
        loadChildren: () => import('../../features/auth/force-change-password/force-change-password.module').then(m => m.ForceChangePasswordModule),
      },

      // Teacher
      {
        path: 'dashboard',
        canActivate: [canActivateForRole('enseignant')],
        loadChildren: () => import('../../features/teacher-dashboard/teacher-dashboard.module').then(m => m.TeacherDashboardModule),
      },
      {
        path: 'etudiants',
        canActivate: [canActivateForRole('enseignant')],
        loadChildren: () => import('../../features/students/students.module').then(m => m.StudentsModule),
      },

      // Student
      {
        path: 'mes-stages',
        canActivate: [canActivateForRole('etudiant')],
        loadChildren: () => import('../../features/student-dashboard/student-dashboard.module').then(m => m.StudentDashboardModule),
      },

      // Shared
      {
        path: 'stages',
        loadChildren: () => import('../../features/stages/stages.module').then(m => m.StagesModule),
      },
      {
        path: 'reunions',
        loadChildren: () => import('../../features/meetings/meetings.module').then(m => m.MeetingsModule),
      },
      {
        path: 'messagerie',
        loadChildren: () => import('../../features/messaging/messaging.module').then(m => m.MessagingModule),
      },
      {
        path: 'notifications',
        loadChildren: () => import('../../features/notifications/notifications.module').then(m => m.NotificationsModule),
      },
    ],
  },
];

@NgModule({
  declarations: [AuthenticatedLayoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatButtonModule,
    SharedModule,
  ],
})
export class AuthenticatedLayoutModule {}
