import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeacherDashboardComponent } from './teacher-dashboard.component';

@NgModule({
  declarations: [TeacherDashboardComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: TeacherDashboardComponent }]),
  ],
})
export class TeacherDashboardModule {}
