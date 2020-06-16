import React, {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { selectors } from '../store';
import { NewGame } from '../components/new-game';
import { PlayBoard } from '../components/play-board/PlayBoard';
import { createUseStyles, useTheme } from 'react-jss';
import {IGameState} from "../store/game-state/gameStateReducers";
import {GameOver} from "../components/gameOver";
import {parse} from "query-string";
import {serverMessage} from "../store/game-state";
import {WEBSOCKET_URL} from "../constants";
import {Waiting} from "../components/waiting";

const useStyles = createUseStyles({
  root: {
    backgroundColor: '#282c34',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'cente',
    justifyContent: 'center',
    fontSize: 18, //calc(10px + 2vmin);
    color: 'white',
    width: '100wv',
  },
});

const getComponent = (gameId?: string, playerId?: string, gameState?: IGameState['gameState']) => {
  if (!gameId) {
    return <NewGame />;
  }

  if (!playerId || gameState === 'waiting') {
    return <Waiting />;
  }

  if (gameState === 'ended') {
    return <GameOver/>
  }
  return <PlayBoard />;
};

const createWS = (
    ref: any,
    playerId: string,
    gameId: string,
    onMessage: (message: any) => void
) => {
  if (ref.current) {
    ref.current.onclose = () => {};
    ref.current.close();
  }
  const ws = new WebSocket(WEBSOCKET_URL);
  ws.onopen = () => {
    console.log('websocket open');
    ws.send(JSON.stringify({ player: playerId, game: gameId }));
  };
  ws.onclose = () => {
    console.log('ws closed reopening');
    createWS(ref, playerId, gameId, onMessage);
  };
  ws.onmessage = ({ data }) => {
    const gameState = JSON.parse(data);
    console.log('got message', gameState);
    onMessage({ gameState });
  };
  ref.current = ws;
};

export const GamePage: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const gameId = useSelector(selectors.gameId);
  const playerId = useSelector(selectors.playerId);
  const gameState = useSelector(selectors.gameState);
  const dispatch = useDispatch();
  const websocketRef = useRef<WebSocket>();

  useEffect(() => {
    const {gameId: qsGameId} = parse(window.location.search);
    if (gameId && gameId !== qsGameId) {
      window.history.replaceState({}, 'That Cards Game', `/?gameId=${gameId}`);
    }
    if (!gameId && qsGameId) {
      window.history.replaceState({}, 'That Cards Game', '/');
    }
  }, [gameId]);

  useEffect(() => {
    if (playerId && gameId) {
      const onMessage = (message: any) => {
        dispatch(serverMessage(message));
      };
      createWS(websocketRef, playerId, gameId, onMessage);
      const ws = websocketRef.current;
      return () => {
        if (ws) {
          ws.onclose = () => {};
          ws.close();
        }
      }
    }
  }, [playerId, gameId, dispatch]);

  return <div className={classes.root}>{getComponent(gameId, playerId, gameState)}</div>;
};
