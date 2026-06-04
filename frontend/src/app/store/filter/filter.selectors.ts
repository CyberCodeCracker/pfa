import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FilterState } from './filter.reducer';

export const selectFilterState = createFeatureSelector<FilterState>('filter');

export const selectFilter = createSelector(selectFilterState, s => s);
export const selectFilterAnnee = createSelector(selectFilterState, s => s.annee);
export const selectFilterSemestre = createSelector(selectFilterState, s => s.semestre);
export const selectFilterEtablissementId = createSelector(selectFilterState, s => s.etablissementId);
