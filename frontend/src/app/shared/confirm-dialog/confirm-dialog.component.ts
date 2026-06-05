import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' colors the confirm button as destructive */
  variant?: 'danger' | 'primary';
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  get confirmLabel(): string { return this.data.confirmLabel ?? 'Confirmer'; }
  get cancelLabel(): string  { return this.data.cancelLabel  ?? 'Annuler'; }
  get isDanger(): boolean    { return this.data.variant === 'danger'; }

  cancel(): void { this.dialogRef.close(false); }
  confirm(): void { this.dialogRef.close(true); }
}
