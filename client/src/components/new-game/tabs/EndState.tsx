import React from 'react';

interface IEndStateProps {
  endStates: any;
  setEndStates: any;
  classes: { [x: string]: any };
}
export const EndState: React.FC<IEndStateProps> = ({
  classes,
  endStates,
  setEndStates,
}) => {
  const hours = Math.floor((endStates.duration || 0) / 60);
  const minutes = Math.floor((endStates.duration || 0) % 60);
  const setRounds = (rounds: string) =>
    setEndStates((current: any) => ({ ...current, rounds: parseInt(rounds) }));
  const setHours = (newHours: string) =>
    setEndStates((current: any) => ({
      ...current,
      duration: parseInt(newHours) * 60 + minutes,
    }));
  const setMinutes = (newMinutes: string) =>
    setEndStates((current: any) => ({
      ...current,
      duration: parseInt(newMinutes) + hours * 60,
    }));
  const setScore = (newScore: string) =>
    setEndStates((current: any) => ({
      ...current,
      score: parseInt(newScore),
    }));
  return (
    <div>
      <h1>When does the game end?</h1>
      <span className={classes.subheading}>Choose one or more conditions to end the game (optional)</span>
      <div className={classes['end-state-panel']}>
        <label>
          <span title="Game continues for round after round after round...">When we get bored &#9432;</span>
          <input
            type="checkbox"
            checked={!Object.values(endStates).some((v) => v)}
            onChange={() => setEndStates({})}
          />
        </label>
        <label>
          <span title="measured from when first black card is dealt">
            Duration &#9432;
          </span>
          <span>
            <input
              type="number"
              value={hours || ''}
              onChange={(e) => setHours(e.target.value)}
            />{' '}
            hours{' '}
            <input
              type="number"
              value={minutes || ''}
              onChange={(e) => setMinutes(e.target.value)}
            />{' '}
            minutes
          </span>
        </label>
        <label>
          <span title="Where a round is one black card dealt">
            Number of rounds &#9432;
          </span>
          <input
            type="number"
            value={endStates.rounds || ''}
            onChange={(e) => setRounds(e.target.value)}
          />
        </label>
        <label>
          <span>When first person scores</span>
          <input type="number" value={endStates.score || ''} onChange={(e) => setScore(e.target.value)}/>
        </label>
      </div>
    </div>
  );
};
