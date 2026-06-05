import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snack: MatSnackBar) {}

  success(message: string): void {
    this.show(message, 'toast-success', 3500);
  }

  error(message: string): void {
    this.show(message, 'toast-error', 5000);
  }

  info(message: string): void {
    this.show(message, 'toast-info', 3500);
  }

  private show(message: string, panelClass: string, duration: number): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['app-toast', panelClass],
    };
    this.snack.open(message, '✕', config);
  }
}
