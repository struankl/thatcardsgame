import { startGame } from '../../store/game-state';
import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectors } from '../../store';
import { createUseStyles, useTheme } from 'react-jss';
import {NewPlayer} from "../new-player";

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
  const playerId = useSelector(selectors.playerId);
  const players = useSelector(selectors.players) || [];
  const gameId = useSelector(selectors.gameId);
  const [link, setLink] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    setLink(`${window.location.href}${window.location.href.includes(gameId || 'xyz') ? '' : `?gameId=${gameId}`}`);
  }, [gameId]);

  const playerMap = () => {
    return players.map((player) => <div>{player.name} has joined</div>);
  };

  const onCopy = () => {
    let copyArea = document.getElementsByClassName(classes['copy-area'])[0];
    // @ts-ignore
    copyArea.select();
    document.execCommand('copy');
    // @ts-ignore
    copyArea.blur();
  };

  if (!isAdmin) {
    return (
      <div>
        {!playerId && <NewPlayer/>}
        {playerId && <div>Waiting for game to start</div>}
        {playerMap()}
      </div>
    );
  }
  return (
    <div className={classes.panel}>
      {!playerId && <NewPlayer/>}
      <span>link to this game: </span>
      <span>
        {link}
        <button onClick={onCopy}>Copy</button>
      </span>
      <span>
        Send this link to friends and family (or even enemies we don't care) to
        join the game. At present you can't just play against rando's
      </span>
      <span>Please send any comments to <a href="mailto:admin@thatcardsgame.com">admin@thatcardsgame.com</a></span>
      <textarea
        className={classes['copy-area']}
        value={link}
        readOnly
      />
      {players.length < 3 && <div>Waiting for enough players to join - need at least 3 players</div>}
      {players.length > 2 && playerId &&(
        <>
          <div>Start the game once everyone has joined</div>
          <button onClick={() => dispatch(startGame())}>Start Game</button>
        </>
      )}
      {players.length > 2 && !playerId &&(
        <>
          <div>You can start the game once you have joined</div>
        </>
      )}
      {playerMap()}
    </div>
  );
};
