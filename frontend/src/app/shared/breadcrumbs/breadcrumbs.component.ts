import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

export interface BreadcrumbItem {
  label: string;
  /** When omitted, the item is rendered as the current (non-clickable) page. */
  link?: string | any[];
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  /** All crumbs between "Accueil" and the current page (current page included as last item without a link). */
  @Input() items: BreadcrumbItem[] = [];

  /** Set false to hide the auto "Accueil" prefix. */
  @Input() showHome = true;

  homeLink$: Observable<string> = this.store.select(selectCurrentUser).pipe(
    map(u => (u?.role === 'etudiant' ? '/mes-stages' : '/dashboard')),
  );

  constructor(private store: Store) {}
}
