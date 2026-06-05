import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StageStatut } from '../../core/models/stage.model';

@Component({
  selector: 'app-stage-status-badge',
  templateUrl: './stage-status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StageStatusBadgeComponent {
  @Input() statut: StageStatut | null | undefined = null;
  /** 'sm' | 'md' */
  @Input() size: 'sm' | 'md' = 'sm';

  get label(): string {
    if (!this.statut) return '';
    return {
      actif:     'Actif',
      suspendu:  'Suspendu',
      'terminé': 'Terminé',
    }[this.statut];
  }

  get icon(): string {
    if (!this.statut) return 'circle';
    return {
      actif:     'bolt',
      suspendu:  'pause_circle',
      'terminé': 'check_circle',
    }[this.statut];
  }

  /** Color classes — bg + text + border accent */
  get colorClass(): string {
    if (!this.statut) return '';
    return {
      actif:     'bg-tertiary-container text-on-tertiary-container border-tertiary/30',
      suspendu:  'bg-error-container text-on-error-container border-error/30',
      'terminé': 'bg-primary-container text-on-primary-container border-primary/30',
    }[this.statut];
  }

  get sizeClass(): string {
    return this.size === 'md'
      ? 'px-3.5 py-1.5 text-xs gap-1.5'
      : 'px-2.5 py-1 text-[10px] gap-1';
  }

  get iconSize(): number {
    return this.size === 'md' ? 16 : 13;
  }
}
