import { createActionGroup, props } from '@ngrx/store';
import { User } from '../../core/models/user.model';

export const FilterActions = createActionGroup({
  source: 'Filter',
  events: {
    'Set Filter': props<{ annee: string; semestre: string; etablissementId: number | null }>(),
    'Init Filter': props<{ user: User }>(),
  },
});
