import { parse } from 'query-string';
import { Reducer } from 'react';
import { LocalActions, LocalActionTypes } from './localActions';

export interface IGame {
  gameId: string;
  playerId: string;
  isAdmin: boolean;
}

export interface ILocalState {
  isAdmin: boolean;
  gameId?: string;
  playerId?: string;
  playedCards: string[];
  winningCard?: number;
}

const queries = parse(window.location.search);
console.log('setting gameId', queries);
const initialState: ILocalState = {
  gameId: queries.gameId as string | undefined,
  isAdmin: !Boolean(queries.gameId),
  playerId: undefined,
  playedCards: [],
};

export const localStateReducers: Reducer<ILocalState, LocalActionTypes> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case LocalActions.PLAY_CARD:
      return {
        ...state,
        playedCards: [...state.playedCards, action.cardId],
      };
    case LocalActions.UNPLAY_CARD:
      return {
        ...state,
        playedCards: state.playedCards.filter(
          (cardId) => cardId !== action.cardId
        ),
      };
    case LocalActions.RESET_PLAYED_CARDS:
      return {
        ...state,
        playedCards: [],
      };
    case LocalActions.SET_GAME_ID:
      return {
        ...state,
        gameId: action.gameId,
      };
    case LocalActions.SET_PLAYER_ID:
      return {
        ...state,
        playerId: action.playerId,
      };
    case LocalActions.SELECT_WINNER:
      return {
        ...state,
        winningCard: action.index,
      };
    case LocalActions.RESET_LOCAL:
      return {
        ...state,
        playedCards: [],
        winningCard: undefined,
      };
    case LocalActions.SET_ADMIN:
      return {
        ...state,
        isAdmin: action.isAdmin,
      };
    default:
      return state;
  }
};
