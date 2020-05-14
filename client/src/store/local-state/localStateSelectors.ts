import { AppState } from '../index';
import { createSelector } from 'reselect';
const getState = (state: AppState) => state.localState;

export const gameId = createSelector(getState, ({ gameId }) => gameId);
export const playerId = createSelector(getState, ({ playerId }) => playerId);
export const isAdmin = createSelector(getState, ({ isAdmin }) => isAdmin);
export const winningCardSelector = createSelector(
  getState,
  ({ winningCard }) => winningCard
);
export const playedCards = createSelector(
  getState,
  ({ playedCards }) => playedCards
);
