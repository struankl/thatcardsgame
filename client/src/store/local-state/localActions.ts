export enum LocalActions {
  PLAY_CARD = 'PLAY_CARD',
  UNPLAY_CARD = 'UNPLAY_CARD',
  RESET_PLAYED_CARDS = 'RESET_PLAYED_CARDS',
  SET_GAME_ID = 'SET_GAME_ID',
  SET_PLAYER_ID = 'SET_PLAYER_ID',
  SELECT_WINNER = 'SELECT_WINNER',
  RESET_LOCAL = 'RESET_LOCAL',
  SET_ADMIN = 'SET_ADMIN',
}

export const playCard = (cardId: string) => ({
  type: LocalActions.PLAY_CARD as typeof LocalActions.PLAY_CARD,
  cardId,
});

export const unplayCard = (cardId: string) => ({
  type: LocalActions.UNPLAY_CARD as typeof LocalActions.UNPLAY_CARD,
  cardId,
});

export const resetPlayedCards = () => ({
  type: LocalActions.RESET_PLAYED_CARDS as typeof LocalActions.RESET_PLAYED_CARDS,
});

export const setGameId = (gameId: string) => ({
  type: LocalActions.SET_GAME_ID as typeof LocalActions.SET_GAME_ID,
  gameId,
});

export const setPlayerId = (playerId: string) => ({
  type: LocalActions.SET_PLAYER_ID as typeof LocalActions.SET_PLAYER_ID,
  playerId,
});

export const selectWinner = (index: number) => ({
  type: LocalActions.SELECT_WINNER as typeof LocalActions.SELECT_WINNER,
  index,
});

export const resetLocal = () => ({
  type: LocalActions.RESET_LOCAL as typeof LocalActions.RESET_LOCAL,
});

export const setAdmin = (isAdmin: boolean) => ({
  type: LocalActions.SET_ADMIN as typeof LocalActions.SET_ADMIN,
  isAdmin,
});

export type LocalActionTypes =
  | ReturnType<typeof playCard>
  | ReturnType<typeof unplayCard>
  | ReturnType<typeof resetPlayedCards>
  | ReturnType<typeof setGameId>
  | ReturnType<typeof selectWinner>
  | ReturnType<typeof resetLocal>
  | ReturnType<typeof setPlayerId>
  | ReturnType<typeof setAdmin>;
