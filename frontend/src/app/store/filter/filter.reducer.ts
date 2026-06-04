import { createReducer, on } from '@ngrx/store';
import { FilterActions } from './filter.actions';

export interface FilterState {
  annee: string;
  semestre: string;
  etablissementId: number | null;
}

const initialState: FilterState = {
  annee: '',
  semestre: '',
  etablissementId: null,
};

function computeCurrentAcademicYear(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function computeCurrentSemestre(): string {
  const month = new Date().getMonth() + 1;
  return month >= 9 || month === 1 ? 'S1' : 'S2';
}

export const filterReducer = createReducer(
  initialState,
  on(FilterActions.setFilter, (_state, { annee, semestre, etablissementId }) => ({
    annee,
    semestre,
    etablissementId,
  })),
  on(FilterActions.initFilter, (_state, { user }) => ({
    annee: computeCurrentAcademicYear(),
    semestre: computeCurrentSemestre(),
    etablissementId: user.etablissements?.[0]?.id ?? null,
  })),
);
