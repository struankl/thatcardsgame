import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { selectors } from '../../store';
import { endRound, redealBlack } from '../../store/game-state';

const useStyles = createUseStyles({
  'czar-messages': {
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  'message-holder': {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
});

export const Czar: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const players = useSelector(selectors.players);
  const blackCard = useSelector(selectors.blackCard) || { id: null };
  const [buttonClicked, setButtonClicked] = useState(false);
  const playerHasPlayed = useMemo<boolean>(
    () => Boolean(players.find(({ hasPlayed }) => hasPlayed)),
    [players]
  );
  const dispatch = useDispatch();
  const onRedealBlack = useCallback(() => {
    setButtonClicked(true);
    dispatch(redealBlack());
  }, [dispatch]);
  const onEndRound = useCallback(() => {
    setButtonClicked(true);
    dispatch(endRound());
  }, [dispatch]);

  useEffect(() => setButtonClicked(false), [blackCard.id]);
  return (
    <div className={classes['message-holder']}>
      <div className={classes['czar-messages']}>You are the card Czar</div>
      <button
        className={classes['czar-messages']}
        onClick={onRedealBlack}
        disabled={playerHasPlayed || buttonClicked}
      >
        Redeal black card
      </button>
      <button
        className={classes['czar-messages']}
        onClick={onEndRound}
        disabled={!playerHasPlayed || buttonClicked}
      >
        End Round in 10 seconds
      </button>
    </div>
  );
};
