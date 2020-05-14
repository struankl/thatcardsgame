import { AppState } from '../index';
import { createSelector } from 'reselect';
const getState = (state: AppState) => state.gameState;

export const gameState = createSelector(getState, ({ gameState }) => gameState);
export const players = createSelector(getState, ({ players }) => players);
export const blackCard = createSelector(getState, ({ blackCard }) => blackCard);
export const isCzar = createSelector(getState, ({ isCzar }) => isCzar);
export const cardsToJudge = createSelector(
  getState,
  ({ playedCards }) => playedCards || []
);
export const whiteCards = createSelector(
  getState,
  ({ whiteCards }) => whiteCards
);
