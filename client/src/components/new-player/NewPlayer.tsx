import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { joinGame } from '../../store/game-state';
import { LOCAL_STORAGE_KEY } from '../../constants';
import { selectors } from '../../store';
import { IGame } from '../../store/local-state/localStateReducers';
import { setAdmin, setPlayerId } from '../../store/local-state/localActions';
import { createUseStyles, useTheme } from 'react-jss';

const useStyles = createUseStyles({
  form: {
    width: 520,
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    margin: 'auto'
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: [[5, 0]],
  },
  'button-row': {
    display: 'flex',
    justifyContent: 'space-around',
    margin: [[5, 0]],
  },
  'left-align': {
    textAlign: 'left',
  },
});
export const NewPlayer: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const gameId = useSelector(selectors.gameId);
  const [name, setName] = useState('');
  const [lastPoop, setLastPoop] = useState(0);
  const dispatch = useDispatch();
  const [buttonClicked, setButtonClicked] = useState(false);
  const games = useMemo<IGame[]>(
    () =>
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]') as IGame[],
    []
  );

  useEffect(() => {
    const game = games.find(({ gameId: gId }) => gId === gameId);
    if (game) {
      dispatch(setPlayerId(game.playerId));
      dispatch(setAdmin(game.isAdmin));
    }
  }, [dispatch, games, gameId]);

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setButtonClicked(true);
      dispatch(joinGame({ name, lastPoop }));
    },
    [dispatch, name, lastPoop]
  );

  return (
    <form onSubmit={onSubmit} className={classes.form}>
      <label className={classes.label}>
        <span className={classes['left-align']}>Nickname:</span>
        <input type="text" onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={classes.label}>
        <span className={classes['left-align']}>
          How many hours ago did you last poop:
        </span>
        <input
          type="number"
          step="any"
          onChange={(e) => setLastPoop(parseFloat(e.target.value))}
        />
      </label>
      <span className={classes['button-row']}>
        <button disabled={buttonClicked} type="submit">
          Join Game
        </button>
      </span>
    </form>
  );
};
