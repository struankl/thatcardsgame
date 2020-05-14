import { IGameState } from './gameStateReducers';

export enum GameActions {
  CONFIRM_CARDS = 'CONFIRM_CARDS',
  CREATE_GAME = 'CREATE_GAME',
  START_GAME = 'START_GAME',
  JOIN_GAME = 'JOIN_GAME',
  SEND_WINNER = 'SEND_WINNER',
  SERVER_MESSAGE = 'SERVER_MESSAGE',
  UPDATE_GAME_STATE = 'UPDATE_GAME_STATE',
  REDEAL_BLACK = 'REDEAL_BLACK',
  END_ROUND = 'END_ROUND',
}

export const confirmCards = () => ({
  type: GameActions.CONFIRM_CARDS as typeof GameActions.CONFIRM_CARDS,
});

export const createGame = ({
  cardsets,
  name,
}: {
  cardsets: number[];
  name: string;
}) => ({
  type: GameActions.CREATE_GAME as typeof GameActions.CREATE_GAME,
  cardsets,
  name,
});

export const startGame = () => ({
  type: GameActions.START_GAME as typeof GameActions.START_GAME,
});

export interface IJoinGameParams {
  name: string;
  lastPoop: number;
}

export const joinGame = ({ name, lastPoop }: IJoinGameParams) => ({
  type: GameActions.JOIN_GAME as typeof GameActions.JOIN_GAME,
  name,
  lastPoop,
});

export const sendWinner = () => ({
  type: GameActions.SEND_WINNER as typeof GameActions.SEND_WINNER,
});

interface IServerMessage {
  gameState?: IGameState;
}

export const serverMessage = (message: IServerMessage) => ({
  type: GameActions.SERVER_MESSAGE as typeof GameActions.SERVER_MESSAGE,
  message,
});

export const updateGameState = (gameState: IGameState) => ({
  type: GameActions.UPDATE_GAME_STATE as typeof GameActions.UPDATE_GAME_STATE,
  gameState,
});

export const redealBlack = () => ({
  type: GameActions.REDEAL_BLACK as typeof GameActions.REDEAL_BLACK,
});

export const endRound = () => ({
  type: GameActions.END_ROUND as typeof GameActions.END_ROUND,
});

export type GameActionTypes =
  | ReturnType<typeof confirmCards>
  | ReturnType<typeof startGame>
  | ReturnType<typeof createGame>
  | ReturnType<typeof joinGame>
  | ReturnType<typeof sendWinner>
  | ReturnType<typeof serverMessage>
  | ReturnType<typeof updateGameState>
  | ReturnType<typeof redealBlack>
  | ReturnType<typeof endRound>;
