import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';

import { StagesComponent } from './stages.component';
import { StageListComponent } from './stage-list/stage-list.component';
import { StageFormComponent } from './stage-form/stage-form.component';
import { StageDetailComponent } from './stage-detail/stage-detail.component';
import { StageStudentsComponent } from './stage-students/stage-students.component';
import { StageDocumentsComponent } from './stage-documents/stage-documents.component';
import { StageMeetingsComponent } from './stage-meetings/stage-meetings.component';
import { StageChatComponent } from './stage-chat/stage-chat.component';
import { StageFeedbackComponent } from './stage-feedback/stage-feedback.component';
import { MeetingCreateDialogComponent } from './meeting-create-dialog/meeting-create-dialog.component';
import { SharedModule } from '../../shared/shared.module';
import { StageMilestonesComponent } from './stage-milestones/stage-milestones.component';

@NgModule({
  declarations: [
    StagesComponent,
    StageListComponent,
    StageFormComponent,
    StageDetailComponent,
    StageStudentsComponent,
    StageDocumentsComponent,
    StageMeetingsComponent,
    StageChatComponent,
    StageFeedbackComponent,
    MeetingCreateDialogComponent,
    StageMilestonesComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDialogModule,
    RouterModule.forChild([
      { path: '',             component: StageListComponent },
      { path: 'nouveau',      component: StageFormComponent },
      { path: ':id',          component: StageDetailComponent },
      { path: ':id/modifier', component: StageFormComponent },
    ]),
  ],
})
export class StagesModule {}
