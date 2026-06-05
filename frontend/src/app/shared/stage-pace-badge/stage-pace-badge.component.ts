import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PaceIndicator } from '../../core/models/stage.model';

@Component({
  selector: 'app-stage-pace-badge',
  templateUrl: './stage-pace-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StagePaceBadgeComponent {
  @Input() pace: PaceIndicator | null | undefined = null;
  @Input() size: 'sm' | 'md' = 'sm';

  get label(): string {
    if (!this.pace) return '';
    return {
      ahead:    'En avance',
      on_track: 'À l\'heure',
      behind:   'En retard',
      at_risk:  'En difficulté',
    }[this.pace];
  }

  get icon(): string {
    if (!this.pace) return '';
    return {
      ahead:    'rocket_launch',
      on_track: 'sentiment_satisfied',
      behind:   'schedule',
      at_risk:  'warning',
    }[this.pace];
  }

  get colorClass(): string {
    if (!this.pace) return '';
    return {
      ahead:    'bg-tertiary text-on-tertiary',
      on_track: 'bg-primary text-white',
      behind:   'bg-secondary-container text-on-secondary-container border border-secondary/40',
      at_risk:  'bg-error text-on-error',
    }[this.pace];
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
