import { useDispatch, useSelector } from 'react-redux';
import {
  cardsToJudge,
  isCzar as isCzarSelector,
} from '../../store/game-state/gameStateSelectors';
import Card from '../card';
import React, { useCallback, useMemo, useState } from 'react';
import { selectWinner } from '../../store/local-state/localActions';
import { winningCardSelector } from '../../store/local-state/localStateSelectors';
import { sendWinner } from '../../store/game-state';
import { createUseStyles, useTheme } from 'react-jss';
import { ICard } from '../../store/game-state/gameStateReducers';
import { selectors } from '../../store';

const useStyles = createUseStyles({
  card: {
    '&:not(:last-child)': {
      height: 'auto',
    },
    '&:not(:first-child)': {
      marginTop: -15,
    },
  },
  'played-area': {
    display: 'flex',
    flexWrap: 'wrap',
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'auto',
    maxHeight: 'calc(100vh - 20px)',
  },
  'card-column': {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
export const JudgeCards: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const cardsArray = useSelector(cardsToJudge);
  const isCzar = useSelector(isCzarSelector);
  const winningCard = useSelector(winningCardSelector);
  const gameState = useSelector(selectors.gameState);
  const dispatch = useDispatch();

  const winner = useCallback((index: number) => dispatch(selectWinner(index)), [
    dispatch,
  ]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const onSendWinner = useCallback(() => {
    setButtonClicked(true);
    dispatch(sendWinner());
  }, [dispatch]);
  const isJudging = useMemo(() => gameState === 'judging' && isCzar, [
    gameState,
    isCzar,
  ]);
  function mapcards(cards: ICard[], index: number) {
    return (
      <div>
        {cards.map(({ id, message }) => (
          <Card
            key={id}
            id={id}
            message={message}
            onClick={isJudging ? () => winner(index) : () => {}}
            selected={isJudging && index === winningCard}
            className={classes.card}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={classes['played-area']}>
      {cardsArray.map((cards, index) => (
        <div key={cards[0].id} className={classes['card-column']}>
          {mapcards(cards, index)}
          <button
            style={{
              visibility:
                isJudging && winningCard === index ? 'visible' : 'hidden',
            }}
            onClick={onSendWinner}
            disabled={buttonClicked}
          >
            Confirm Selection
          </button>
        </div>
      ))}
    </div>
  );
};
