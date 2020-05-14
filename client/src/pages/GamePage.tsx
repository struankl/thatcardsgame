import React from 'react';
import { useSelector } from 'react-redux';
import { selectors } from '../store';
import { NewGame } from '../components/new-game';
import { NewPlayer } from '../components/new-player';
import { PlayBoard } from '../components/play-board/PlayBoard';
import { createUseStyles, useTheme } from 'react-jss';

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

const getComponent = (gameId?: string, playerId?: string) => {
  if (!gameId) {
    return <NewGame />;
  }

  if (!playerId) {
    return <NewPlayer />;
  }
  return <PlayBoard />;
};

export const GamePage: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const gameId = useSelector(selectors.gameId);
  const playerId = useSelector(selectors.playerId);
  return <div className={classes.root}>{getComponent(gameId, playerId)}</div>;
};
