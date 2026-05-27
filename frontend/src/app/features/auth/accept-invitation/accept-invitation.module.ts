import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AcceptInvitationComponent } from './accept-invitation.component';

@NgModule({
  declarations: [AcceptInvitationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: AcceptInvitationComponent }]),
  ],
})
export class AcceptInvitationModule {}
