import React, { useCallback, useEffect, useState } from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { useDrop } from 'react-dnd';
import { useMediaQuery } from 'react-responsive';
import Card from '../card';

import { useDispatch, useSelector } from 'react-redux';
import { selectors } from '../../store';
import {
  playCard as playCardAction,
  unplayCard as unplayCardAction,
} from '../../store/local-state/localActions';
import { CardsPlayed } from '../cards-played/CardsPlayed';
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
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr max-content max-content',
    gridAutoRows: 'max-content',
    margin: [[5, 15]],
    width: 150,
    maxWidth: 'calc(50vw - 42px)',
    overflow: 'hidden',
    transition: 'width 0.5s ease, margin 0.5s ease, padding 0.5s ease',
  },
  'small-players': {
    position: 'absolute',
    zIndex: 100,
    backgroundColor: 'black',
    padding: 10,
    left: -16,
    top: -4,
  },
  'hidden-players': {
    width: 0,
    margin: 0,
    padding: 0,
  },
  hand: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    overflow: 'auto',
    minHeight: 170,
    position: 'relative',
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

export const PlayBoard = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const playedCards = useSelector(selectors.playedCards);
  const gameState = useSelector(selectors.gameState);
  const whiteCardsSelected = useSelector(selectors.whiteCards) || [];
  const isCzar = useSelector(selectors.isCzar);
  const isPlaying = gameState === 'playing';
  const hasPlayed = gameState === 'played';
  const blackCard = useSelector(selectors.blackCard);
  const cardsToJudge = useSelector(selectors.cardsToJudge) || [];
  const pick = blackCard ? blackCard.pick : 0;
  const canPlay = (id: string) =>
    !isCzar &&
    !playedCards.includes(id) &&
    isPlaying &&
    playedCards.length < pick;
  const dispatch = useDispatch();
  const [whiteCards, setWhiteCards] = useState<ICard[]>([]);
  const isLarge = useMediaQuery({ query: '(min-width: 574px)' });
  const judgingWidth = 192 * (cardsToJudge.length + 2);
  const isLargeEnoughForJudging = useMediaQuery({query: `(min-width: ${judgingWidth}px)`});
  const hideLarge = gameState === 'judging' && !isLargeEnoughForJudging;
  const [hiddenClasses, setHiddenClasses] = useState<{ [x: string]: string }>(
    {}
  );

  const [hideSmallPlayers, setHideSmallPlayers] = useState(false);

  useEffect(() => {
    if (gameState === 'playing') {
      setTimeout(() => setHideSmallPlayers(true), 5000);
    }
    if (gameState === 'judging') {
      setHideSmallPlayers(false);
    }
  }, [gameState]);

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
          {isLarge && (
            <div
              className={clsx(classes.players, {
                [classes['hidden-players']]: hideLarge,
              })}
            >
              <Players />
            </div>
          )}
          <div>
            {blackCard && (
              <Card isBlack message={blackCard.message} id={blackCard.id} />
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
          {['judging', 'judged'].includes(gameState) && <JudgeCards />}
        </div>
        <hr className={classes.hr} />
        <div className={classes.hand} ref={unPlayDrop}>
          {!isLarge && (
            <div
              className={clsx(classes.players, classes['small-players'], {
                [classes['hidden-players']]: hideSmallPlayers
              })}
            >
              <Players />
            </div>
          )}
          {whiteCards &&
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
