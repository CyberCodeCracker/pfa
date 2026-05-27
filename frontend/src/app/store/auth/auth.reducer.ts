import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, state => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user }) => ({ ...state, user, loading: false, error: null, initialized: true })),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error, initialized: true })),

  on(AuthActions.loadMe, state => ({ ...state, loading: true })),
  on(AuthActions.loadMeSuccess, (state, { user }) => ({ ...state, user, loading: false, initialized: true })),
  on(AuthActions.loadMeFailure, state => ({ ...state, user: null, loading: false, initialized: true })),

  on(AuthActions.logoutSuccess, () => ({ ...initialAuthState, initialized: true })),
  on(AuthActions.clearUser, () => ({ ...initialAuthState, initialized: true })),
  on(AuthActions.updateUser, (state, { user }) => ({ ...state, user })),
);
