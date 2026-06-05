import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../shared/shared.module';
import { StudentDashboardComponent } from './student-dashboard.component';

@NgModule({
  declarations: [StudentDashboardComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: StudentDashboardComponent }]),
  ],
})
export class StudentDashboardModule {}
