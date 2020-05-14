import React from 'react';
import { useSelector } from 'react-redux';
import { selectors } from '../../store';
import { createUseStyles, useTheme } from 'react-jss';
import { ReactComponent as Cards } from '../../icons/cards.svg';
import { ReactComponent as Crown } from '../../icons/crown1.svg';
import clsx from 'clsx';

const useStyles = createUseStyles({
  player: {
    display: 'flex',
    justifyContent: 'space-between',
    '&:before': {
      content: "'\\2b55'",
    },
    '&.active': {
      '&:before': {
        content: "'\\2b24'",
      },
    },
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  'player-name': {
    flexShrink: 1,
    flexGrow: 1,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  'cards-icon': {
    fill: 'white',
    width: 20,
    height: 20,
    margin: [[0, 5]],
  },
});

export const Players: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const players = useSelector(selectors.players);
  return (
    <>
      {players &&
        players.map(
          (
            {
              name: playerName,
              score,
              isCzar: playerIsCzar,
              hasPlayed,
              isActive,
            },
            index
          ) => (
            <div
              key={`${playerName}-${index}`}
              className={clsx(classes.player, { active: isActive })}
            >
              <span className={classes['player-name']}>{playerName}</span>
              {playerIsCzar && <Crown className={classes['cards-icon']} />}
              {hasPlayed && <Cards className={classes['cards-icon']} />}
              <span>{score}</span>
            </div>
          )
        )}
    </>
  );
};
