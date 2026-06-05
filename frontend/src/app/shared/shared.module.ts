import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { CompletionWheelComponent } from './completion-wheel/completion-wheel.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';
import { StagePaceBadgeComponent } from './stage-pace-badge/stage-pace-badge.component';
import { StageStatusBadgeComponent } from './stage-status-badge/stage-status-badge.component';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    CompletionWheelComponent,
    ConfirmDialogComponent,
    ScrollTopComponent,
    StageStatusBadgeComponent,
    StagePaceBadgeComponent,
  ],
  imports: [CommonModule, RouterModule, MatDialogModule, MatSnackBarModule],
  exports: [
    BreadcrumbsComponent,
    CompletionWheelComponent,
    ScrollTopComponent,
    StageStatusBadgeComponent,
    StagePaceBadgeComponent,
    MatDialogModule,
    MatSnackBarModule,
  ],
})
export class SharedModule {}
