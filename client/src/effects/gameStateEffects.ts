import { Epic, ofType } from 'redux-observable';
import { actions as toastrActions } from 'react-redux-toastr';
import {
  confirmCards,
  createGame,
  endRound,
  GameActions,
  joinGame,
  redealBlack,
  sendWinner,
  serverMessage,
  startGame,
  updateGameState,
} from '../store/game-state';
import { AppState } from '../store';
import { switchMap, tap, withLatestFrom, ignoreElements } from 'rxjs/operators';
import { concat, EMPTY, from, Observable, of } from 'rxjs';
import {
  createPlayerService,
  createGameService,
  startGameService,
  playCardsService,
  sendWinnerService,
  redealBlackService,
  sendEndRoundService,
} from '../services/game-services';
import {
  resetLocal,
  setGameId,
  setPlayerId,
} from '../store/local-state/localActions';
import { LOCAL_STORAGE_KEY } from '../constants';

export const createGameEffect: Epic<
  ReturnType<typeof createGame>,
  any,
  AppState
> = (action$) =>
  action$.pipe(
    ofType(GameActions.CREATE_GAME),
    switchMap((action) =>
      from(createGameService(action)).pipe(
        switchMap((response) => of(setGameId(response.uuid)))
      )
    )
  );

export const startGameEffect: Epic<
  ReturnType<typeof startGame>,
  any,
  AppState
> = (action$, state$) =>
  action$.pipe(
    ofType(GameActions.START_GAME),
    withLatestFrom(state$),
    tap(([, { localState }]) => startGameService(localState.gameId || '')),
    ignoreElements()
  );

export const joinGameEffect: Epic<
  ReturnType<typeof joinGame>,
  any,
  AppState
> = (action$, state$) =>
  action$.pipe(
    ofType(GameActions.JOIN_GAME),
    withLatestFrom(state$),
    switchMap(([{ name, lastPoop }, { localState }]) =>
      from(
        createPlayerService({ name, lastPoop, gameId: localState.gameId || '' })
      ).pipe(
        switchMap((response) => {
          const games = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
          );
          games.push({
            gameId: localState.gameId,
            playerId: response.playerId,
            isAdmin: Boolean(localState.isAdmin),
          });
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games));
          return of(setPlayerId(response.playerId));
        })
      )
    )
  );

export const playCardsEffect: Epic<
  ReturnType<typeof confirmCards>,
  any,
  AppState
> = (action$, state$) =>
  action$.pipe(
    ofType(GameActions.CONFIRM_CARDS),
    withLatestFrom(state$),
    tap(([, { localState }]) =>
      playCardsService({
        gameId: localState.gameId || '',
        playerId: localState.playerId || '',
        cards: localState.playedCards,
      })
    ),
    ignoreElements()
  );

export const redealBlackEffect: Epic<
  ReturnType<typeof redealBlack>,
  any,
  AppState
> = (action$, state$) =>
  action$.pipe(
    ofType(GameActions.REDEAL_BLACK),
    withLatestFrom(state$),
    tap(([, { localState }]) =>
      redealBlackService({
        gameId: localState.gameId || '',
      })
    ),
    ignoreElements()
  );

export const endRoundEffect: Epic<
  ReturnType<typeof endRound>,
  any,
  AppState
> = (action$, state$) =>
  action$.pipe(
    ofType(GameActions.END_ROUND),
    withLatestFrom(state$),
    tap(([, { gameState, localState }]) =>
      sendEndRoundService({
        gameId: localState.gameId || '',
        round: gameState.round,
      })
    ),
    ignoreElements()
  );

export const sendWinnerEffect: Epic<
  ReturnType<typeof sendWinner>,
  any,
  AppState
> = (action$, state$) =>
  action$.pipe(
    ofType(GameActions.SEND_WINNER),
    withLatestFrom(state$),
    tap(
      ([
        ,
        {
          localState: { gameId, winningCard },
          gameState: { playedCards },
        },
      ]) => {
        if (gameId && playedCards && typeof winningCard === 'number') {
          sendWinnerService({
            gameId,
            card: playedCards[winningCard][0].id,
          });
        }
      }
    ),
    ignoreElements()
  );

export const gameStateChangeEffect: Epic<
  ReturnType<typeof serverMessage>,
  any,
  AppState
> = (action$, state$) =>
  action$.pipe(
    ofType(GameActions.SERVER_MESSAGE),
    withLatestFrom(state$),
    switchMap(
      ([
        {
          message: { gameState },
        },
        { gameState: currentGameState },
      ]) => {
        const newState = gameState?.gameState !== currentGameState.gameState;
        const actions: Observable<any>[] = [];
        if (gameState) {
          actions.push(of(updateGameState(gameState)));
        }
        if (gameState && newState) {
          actions.push(of(toastrActions.removeByType('success')));
          actions.push(of(toastrActions.remove('round-end-warning')));
          switch (gameState.gameState) {
            case 'playing':
              actions.push(of(resetLocal()));
              break;
            case 'judged':
              actions.push(
                of(
                  toastrActions.add({
                    type: 'success',
                    title: `${gameState.winner} wins`,
                    position: 'top-right', // This will override the global props position.
                    message: 'next round in 10 seconds',
                    options: {
                      timeOut: 0,
                    },
                  })
                )
              );
          }
        }
        if (currentGameState.roundEndTime !== gameState?.roundEndTime) {
          // actions.push(of(toastrActions.remove('round-end-warning')));
          if (gameState?.roundEndTime) {
            actions.push(
              of(
                toastrActions.add({
                  type: 'warning',
                  id: 'round-end-warning',
                  title: `Round ending soon`,
                  position: 'top-right', // This will override the global props position.
                  message: 'play your cards within next 10 seconds',
                  options: {
                    timeOut: 10,
                  },
                })
              )
            );
          }
        }
        return actions.length ? concat(...actions) : EMPTY;
      }
    )
  );
