import React, { FC, useCallback, useState } from 'react';
import Card from '../card/Card';
import { useDispatch, useSelector } from 'react-redux';
import { selectors } from '../../store';
import { createUseStyles, useTheme } from 'react-jss';
import { useDrop } from 'react-dnd';
import { confirmCards } from '../../store/game-state';
import clsx from 'clsx';

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  cardsHolder: {
    width: 192,
    maxWidth: '50vw',
  },
  cardsPlayed: {
    minHeight: 212,
  },
  card: {
    '&:not(:last-child)': {
      height: 'auto',
    },
    '&:not(:first-child)': {
      marginTop: -15,
    },
  },
  hidden: {
    visibility: 'hidden',
  },
});

interface ICardsPlayedProps {
  onPlayed: (id: string) => void;
  onUnplayed: (id: string) => void;
  canPlay: (id: string) => boolean;
}
export const CardsPlayed: FC<ICardsPlayedProps> = ({
  onPlayed,
  onUnplayed,
  canPlay,
}) => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const dispatch = useDispatch();
  const playedCards = useSelector(selectors.playedCards);
  const whiteCards = useSelector(selectors.whiteCards);
  const gameState = useSelector(selectors.gameState);
  const blackCard = useSelector(selectors.blackCard);
  const [hasPlayed, setHasPlayed] = useState<boolean>(false);

  const [, playDrop] = useDrop({
    accept: 'CARD',
    drop: (item: any) => {
      onPlayed(item.id);
    },
    canDrop: (item: any) => canPlay(item.id),
  });

  const onConfirmSelection = useCallback(() => {
    setHasPlayed(true);
    dispatch(confirmCards());
  }, [dispatch]);

  return (
    <div className={classes.container}>
      <div className={classes.cardsHolder}>
        <div className={classes.cardsPlayed} ref={playDrop}>
          {playedCards.length > 0 &&
            playedCards
              .map((cardId) => whiteCards.find(({ id }) => cardId === id))
              .map(
                (whiteCard) =>
                  whiteCard && (
                    <Card
                      message={whiteCard.message}
                      key={whiteCard.id}
                      id={whiteCard.id}
                      onClick={() => onUnplayed(whiteCard.id)}
                      className={classes.card}
                      data-cardid={whiteCard.id}
                    />
                  )
              )}
        </div>
        <button
          onClick={onConfirmSelection}
          className={clsx({
            [classes.hidden]:
              gameState !== 'playing' || playedCards.length !== blackCard?.pick,
          })}
          disabled={hasPlayed}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};
