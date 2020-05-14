import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { useDrop } from 'react-dnd';
import Card from '../card';

import { useDispatch, useSelector } from 'react-redux';
import { serverMessage } from '../../store/game-state';
import { selectors } from '../../store';
import {
  playCard as playCardAction,
  unplayCard as unplayCardAction,
} from '../../store/local-state/localActions';
import { WEBSOCKET_URL } from '../../constants';
import { CardsPlayed } from '../cards-played/CardsPlayed';
import { Waiting } from '../waiting';
import { Czar } from '../czar';
import { Players } from '../players';
import { JudgeCards } from '../judge-cards';
import clsx from 'clsx';
import { ICard } from '../../store/game-state/gameStateReducers';
import { isEqual } from 'lodash';

const useStyles = createUseStyles({
  playingArea: {
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'flex-start',
  },

  blackCardArea: {
    width: 190,
    height: 210,
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100wv',
  },
  hr: {
    width: '100%',
  },
  cardsPlayed: {
    display: 'flex',
    flexGrow: 1,
  },
  players: {
    display: 'flex',
    flexDirection: 'column',
    margin: [[5, 15]],
  },
  hand: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    overflow: 'auto',
    minHeight: 170,
  },
  'white-card': {
    animation: '$fadeIn 0.25s',
    '&.played': {
      animation: '$fadeOut 0.25s',
    },
    '&.hidden': {
      display: 'none',
    },
    '&.invisible': {
      visibility: 'hidden',
    },
  },
  '@keyframes fadeIn': {
    from: {
      width: 0,
      margin: 0,
      borderWidth: 0,
    },
  },
  '@keyframes fadeOut': {
    to: {
      width: 0,
      margin: 0,
      borderWidth: 0,
    },
  },
});

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

export const PlayBoard = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const playedCards = useSelector(selectors.playedCards);
  const gameState = useSelector(selectors.gameState);
  const whiteCardsSelected = useSelector(selectors.whiteCards) || [];
  const playerId = useSelector(selectors.playerId);
  const gameId = useSelector(selectors.gameId);
  const isCzar = useSelector(selectors.isCzar);
  const isPlaying = gameState === 'playing';
  const hasPlayed = gameState === 'played';
  const blackCard = useSelector(selectors.blackCard);
  const pick = blackCard ? blackCard.pick : 0;
  const canPlay = (id: string) =>
    !isCzar &&
    !playedCards.includes(id) &&
    isPlaying &&
    playedCards.length < pick;
  const dispatch = useDispatch();

  const websocketRef = useRef();
  const [whiteCards, setWhiteCards] = useState<ICard[]>([]);

  const [hiddenClasses, setHiddenClasses] = useState<{ [x: string]: string }>(
    {}
  );

  useEffect(() => {
    if (isEqual(whiteCards, whiteCardsSelected)) {
      return;
    }
    let newCards: string[] = [];
    setWhiteCards((current) => {
      const existingCards = current.map(({ id }) => id);
      newCards = (whiteCardsSelected || [])
        .map(({ id }) => id)
        .filter((id) => !existingCards.includes(id));
      return whiteCardsSelected;
    });
    setHiddenClasses((current) => ({
      ...current,
      ...newCards.reduce(
        (acc, id) => ({
          ...acc,
          [id]: 'invisible',
        }),
        {}
      ),
    }));
  }, [whiteCardsSelected, whiteCards]);

  const animationStart = useCallback((e: AnimationEvent) => {
    // @ts-ignore
    const cardId = e.target?.getAttribute('data-cardid');
    if (
      e.animationName.includes('fadeIn') ||
      e.animationName.includes('fadeOut')
    ) {
      setHiddenClasses((currentValue) => ({
        ...currentValue,
        [cardId]: 'invisible',
      }));
    }
  }, []);

  const animationEnd = useCallback((e: AnimationEvent) => {
    // @ts-ignore
    const cardId = e.target?.getAttribute('data-cardid');
    if (e.animationName.includes('fadeOut')) {
      setHiddenClasses((currentValue) => ({
        ...currentValue,
        [cardId]: 'hidden',
      }));
    }
    if (e.animationName.includes('fadeIn')) {
      setHiddenClasses((currentValue) => ({
        ...currentValue,
        [cardId]: undefined,
      }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('animationstart', animationStart);
    return () => document.removeEventListener('animationstart', animationStart);
  }, [animationStart]);

  useEffect(() => {
    document.addEventListener('animationend', animationEnd);
    return () => document.removeEventListener('animationend', animationEnd);
  }, [animationEnd]);

  useEffect(() => {
    if (playerId && gameId) {
      const onMessage = (message: any) => {
        dispatch(serverMessage(message));
      };
      createWS(websocketRef, playerId, gameId, onMessage);
    }
  }, [playerId, gameId, dispatch]);

  const playCard = (id: string) => {
    if (canPlay(id)) {
      dispatch(playCardAction(id));
    }
  };

  const unPlayCard = (id: string) => {
    if (canUnplay({ id }) && playedCards.includes(id)) {
      dispatch(unplayCardAction(id));
      setHiddenClasses((current) => ({
        ...current,
        [id]: 'invisible',
      }));
    }
  };

  const canUnplay = (item: any) => isPlaying && playedCards.includes(item.id);
  const [, unPlayDrop] = useDrop({
    accept: 'CARD',
    drop: (item: any) => {
      unPlayCard(item.id);
    },
    canDrop: canUnplay,
  });

  return (
    <>
      <div className={classes.main}>
        <div className={classes.playingArea}>
          <div>
            {blackCard && (
              <Card isBlack message={blackCard.message} id={blackCard.id} />
            )}
            {gameState !== 'waiting' && (
              <div className={classes.players}>
                <Players />
              </div>
            )}
          </div>
          {(isPlaying || hasPlayed) && !isCzar && (
            <CardsPlayed
              onPlayed={playCard}
              onUnplayed={unPlayCard}
              canPlay={canPlay}
            />
          )}
          {isPlaying && isCzar && <Czar />}
          {gameState === 'waiting' && <Waiting />}
          {['judging', 'judged'].includes(gameState) && <JudgeCards />}
        </div>
        <hr className={classes.hr} />
        <div className={classes.hand} ref={unPlayDrop}>
          {gameState !== 'waiting' &&
            whiteCards &&
            whiteCards.map(({ message, id }) => (
              <Card
                className={clsx(classes['white-card'], hiddenClasses[id], {
                  played: playedCards.includes(id),
                })}
                message={message}
                id={id}
                key={id}
                onClick={() => playCard(id)}
                data-cardid={id}
              />
            ))}
        </div>
      </div>
    </>
  );
};
