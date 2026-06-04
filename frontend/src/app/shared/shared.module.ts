import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CompletionWheelComponent } from './completion-wheel/completion-wheel.component';

@NgModule({
  declarations: [CompletionWheelComponent],
  imports: [CommonModule],
  exports: [CompletionWheelComponent],
})
export class SharedModule {}
