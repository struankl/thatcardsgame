import React from 'react';

interface INameProps {
  name: string;
  setName: (name: string) => void;
  classes: { [x: string]: any };
}
export const Name: React.FC<INameProps> = ({ name, setName, classes }) => (
  <div>
    <label>
      Game Name:
      <input
        className={classes['game-name']}
        type="text"
        placeholder="E.G. Thursday night game with Nan & Pop's"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
    </label>
  </div>
);
