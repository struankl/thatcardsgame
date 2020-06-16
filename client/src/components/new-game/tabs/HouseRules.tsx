import React from 'react';
import { IRule } from '../../../services/game-services';

interface IHouseRulesProps {
  rules: IRule[];
  setRules: (x: (y: IRule[]) => IRule[]) => void;
  classes: { [x: string]: any };
}

export const HouseRules: React.FC<IHouseRulesProps> = ({
  rules,
  setRules,
  classes,
}) => {
  const selectRule = (id: number) =>
    setRules((current) =>
      current.map((rule) =>
        rule.id === id ? { ...rule, selected: !rule.selected } : rule
      )
    );

  return (
    <div>
      <h1>Select house rules for this game</h1>
      <span className={classes.subheading}>Add additional rules for the game (optional)</span>
      <div className={classes['rules-panel']}>
        {rules.map((r) => (
          <label key={r.id} className={classes.rule}>
            <span className={classes['rule-name']}>{r.name}</span>
            <div className={classes['rule-body']}>
              <span className={classes['rule-description']}>
                {r.description}
              </span>
              <input
                type="checkbox"
                checked={r.selected}
                onChange={() => selectRule(r.id)}
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
