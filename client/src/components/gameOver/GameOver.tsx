import {useDispatch, useSelector} from 'react-redux';
import { selectors } from '../../store';
import { IPlayer } from '../../store/game-state/gameStateReducers';
import React, { useMemo } from 'react';
import {Players} from "../players";
import {setGameId, setPlayerId} from "../../store/local-state/localActions";
import {createUseStyles, useTheme} from "react-jss";

const useStyles = createUseStyles({
  'good-looking': {
    margin: [[10, 'auto']]
  }
});

const hashCode = (s: string) => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);

export const GameOver: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const players = useSelector(selectors.players);

  const winners = players.reduce((acc: IPlayer[], player) => {
    if (player.score < acc[0]?.score) {
      return acc;
    }
    if (player.score === acc[0]?.score) {
      return [...acc, player];
    }
    return [player];
  }, []);

  const overAllWinner = useMemo(
    () => [...winners].sort((a, b) => hashCode(a.name) - hashCode(b.name))[0],
    [winners]
  );

  const dispatch = useDispatch();

    const onLeave = () => {
        dispatch(setGameId(''));
        dispatch(setPlayerId(''));
    };
    return (
    <div>
      <h1>Game Overs</h1>
      <h3>{winners.length > 1 ? 'Winners' : 'Winner'}</h3>
      <div>
        {winners.map((player) => (
          <div key={player.id}>{player.name}</div>
        ))}
      </div>
      {winners.length > 1 && (
        <div className={classes['good-looking']}>
          I reckon {overAllWinner.name}&rsquo;
          {overAllWinner.name.endsWith('s') ? '' : 's'} the best looking, so I&rsquo;m
          giving it to them
        </div>
      )}
      <hr />
      <Players/>
      <hr />
      <button onClick={onLeave}>Leave Game</button>
    </div>
  );
};
