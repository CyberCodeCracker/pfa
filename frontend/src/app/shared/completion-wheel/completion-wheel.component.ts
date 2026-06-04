import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-completion-wheel',
  templateUrl: './completion-wheel.component.html',
  styleUrls: ['./completion-wheel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletionWheelComponent {
  @Input() done = 0;
  @Input() total = 0;
  /** Diameter in px */
  @Input() size = 56;
  /** Stroke width in px */
  @Input() stroke = 5;
  /** Show count text "3/6" instead of percentage */
  @Input() showCount = false;

  get pct(): number {
    if (this.total <= 0) return 0;
    return Math.round((this.done / this.total) * 100);
  }

  get radius(): number {
    return (this.size - this.stroke) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset(): number {
    return this.circumference * (1 - this.pct / 100);
  }

  get center(): number {
    return this.size / 2;
  }

  /** Color band based on progress */
  get ringClass(): string {
    if (this.pct === 0)   return 'text-outline-variant';
    if (this.pct < 40)    return 'text-error';
    if (this.pct < 80)    return 'text-tertiary';
    return 'text-primary';
  }

  get label(): string {
    return this.showCount ? `${this.done}/${this.total}` : `${this.pct}%`;
  }
}
