import { Reducer } from 'react';
import { GameActions, GameActionTypes } from './index';

export interface ICard {
  id: string;
  message: string;
  watermark: string;
}

export interface IBlackCard extends ICard {
  pick: number;
}

export interface IPlayer {
  name: string;
  score: number;
  isCzar: boolean;
  id: string;
  hasPlayed: boolean;
  isActive: boolean;
}
export interface IGameState {
  gameState:
    | 'waiting'
    | 'playing'
    | 'played'
    | 'judging'
    | 'judged'
    | 'complete';
  players: IPlayer[];
  playedCards?: ICard[][];
  blackCard?: IBlackCard;
  winner?: string;
  whiteCards: ICard[];
  isCzar: boolean;
  round: number;
  roundEndTime?: string;
}

export interface ICardset {
  id: number;
  name: string;
  weight: number;
}

const initialState: IGameState = {
  gameState: 'waiting',
  players: [],
  whiteCards: [],
  isCzar: false,
  round: 0,
};

export const gameStateReducers: Reducer<IGameState, GameActionTypes> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case GameActions.UPDATE_GAME_STATE:
      return action.gameState;
    default:
      return state;
  }
};
