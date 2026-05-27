import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../../core/models/user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login':          props<{ email: string; password: string; remember?: boolean }>(),
    'Login Success':  props<{ user: User }>(),
    'Login Failure':  props<{ error: string }>(),

    'Load Me':          emptyProps(),
    'Load Me Success':  props<{ user: User }>(),
    'Load Me Failure':  emptyProps(),

    'Logout':         emptyProps(),
    'Logout Success': emptyProps(),

    'Clear User':     emptyProps(),
    'Update User':    props<{ user: User }>(),
  },
});
