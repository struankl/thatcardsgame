import React from 'react';
import { ICardSet } from '../../../services/game-services';

interface ICardsSetsProps {
  cardsets: ICardSet[];
  setCardsets: (x: (y: ICardSet[]) => ICardSet[]) => void;
  classes: { [x: string]: any };
}
export const CardsSets: React.FC<ICardsSetsProps> = ({
  cardsets,
  setCardsets,
  classes,
}) => {
  const selectCardSet = (id: number) =>
    setCardsets((current) =>
      current.map((cs) =>
        cs.id === id ? { ...cs, selected: !cs.selected } : cs
      )
    );

  const onSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    setCardsets((current) => {
      const allSet = current.every((cs) => cs.selected);
      return current.map((cs) => ({ ...cs, selected: !allSet }));
    });
  };

  return (
    <div>
      <h1>Select cardsets for this game</h1>
      <button type="button" onClick={onSelectAll}>
        select all
      </button>
      <div className={classes.cardsets}>
        {cardsets.map((cs) => (
          <label key={cs.id}>
            <span className={classes['cardset-name']}>{cs.name}</span>
            <input
              type="checkbox"
              checked={cs.selected}
              onChange={() => selectCardSet(cs.id)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};
