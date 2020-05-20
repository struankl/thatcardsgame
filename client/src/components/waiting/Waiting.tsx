import { startGame } from '../../store/game-state';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectors } from '../../store';
import { createUseStyles, useTheme } from 'react-jss';

const useStyles = createUseStyles({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    '& span, & div': {
      margin: 5,
    },
    '& button': {
      marginLeft: 5
    },
    '& a': {
      color: 'white'
    }
  },
  'copy-area': {
    position: 'absolute',
    left: -10000,
  },
});

export const Waiting: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const isAdmin = useSelector(selectors.isAdmin);
  const gameId = useSelector(selectors.gameId);
  const players = useSelector(selectors.players);
  const dispatch = useDispatch();

  const playerMap = () => {
    return players.map((player) => <div>{player.name} has joined</div>);
  };

  const onCopy = useCallback(() => {
    let copyArea = document.getElementsByClassName(classes['copy-area'])[0];
    // @ts-ignore
    copyArea.select();
    document.execCommand('copy');
    // @ts-ignore
    copyArea.blur();
  }, [classes]);

  if (!isAdmin) {
    return (
      <div>
        <div>Waiting for game to start</div>
        {playerMap()}
      </div>
    );
  }
  return (
    <div className={classes.panel}>
      <span>link to this game: </span>
      <span>
        {window.location.href}?gameId={gameId}
        <button onClick={onCopy}>Copy</button>
      </span>
      <span>
        Send this link to friends and family (or even enemies we don't care) to
        join the game. At present you can't just play against rando's
      </span>
      <span>Please send any comments to <a href="mailto:admin@thatcardsgame.com">admin@thatcardsgame.com</a></span>
      <textarea
        className={classes['copy-area']}
        value={`${window.location.href}?gameId=${gameId}`}
        readOnly
      />
      {players.length < 3 && <div>Waiting for enough players to join - need at least 3 players</div>}
      {players.length > 2 && (
        <>
          <div>Start the game once everyone has joined</div>
          <button onClick={() => dispatch(startGame())}>Start Game</button>
        </>
      )}
      {playerMap()}
    </div>
  );
};
