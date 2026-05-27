import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ForceChangePasswordComponent } from './force-change-password.component';

@NgModule({
  declarations: [ForceChangePasswordComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild([{ path: '', component: ForceChangePasswordComponent }])],
})
export class ForceChangePasswordModule {}
