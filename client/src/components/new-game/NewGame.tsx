import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createGame } from '../../store/game-state';
import { IGame } from '../../store/local-state/localStateReducers';
import { LOCAL_STORAGE_KEY } from '../../constants';
import {
  setAdmin,
  setGameId,
  setPlayerId,
} from '../../store/local-state/localActions';
import { getCardsetsService, getGameNames } from '../../services/game-services';
import { createUseStyles, useTheme } from 'react-jss';
import { ReactComponent as Cards } from '../../icons/cards.svg';
import { ReactComponent as Crown } from '../../icons/crown1.svg';

interface ICardSet {
  name: string;
  id: number;
  weight: number;
  selected: boolean;
}

const useStyles = createUseStyles({
  cardsets: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    width: '100vw',
    maxWidth: '900px',
    margin: 'auto',
  },
  'cardset-name': {
    width: 230,
    display: 'inline-block',
    textAlign: 'left',
  },
  'game-name': {
    width: 300,
    margin: 20,
  },
  'cards-icon': {
    fill: 'white',
    width: 20,
    height: 20,
    margin: [[0, 5]],
  },
  notices: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    maxWidth: '900px',
    margin: 'auto',
    '&> span': {
      margin: 5,
    },
    '& a': {
      color: 'white',
    },
  },
});

export const NewGame: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const dispatch = useDispatch();
  const [buttonClicked, setButtonClicked] = useState(false);
  const [cardsets, setCardsets] = useState<ICardSet[]>([]);
  const [name, setName] = useState('');
  const [gameNames, setGameNames] = useState<{ id: string; name: string }[]>(
    []
  );

  const games = useMemo<IGame[]>(
    () =>
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]') as IGame[],
    []
  );

  useEffect(() => {
    getCardsetsService().then((response) =>
      setCardsets(response.map((r) => ({ ...r, selected: false })))
    );
  }, []);

  useEffect(() => {
    getGameNames(games.map(({ gameId }) => gameId)).then((response) =>
      setGameNames(response)
    );
  }, [games]);

  const onCreateGame = useCallback(
    (e) => {
      e.preventDefault();
      setButtonClicked(true);
      if (!name || !cardsets.some(({ selected }) => selected)) {
        return;
      }
      dispatch(
        createGame({
          name,
          cardsets: cardsets
            .filter(({ selected }) => selected)
            .map(({ id }) => id),
        })
      );
    },
    [dispatch, cardsets, name]
  );

  const onChooseGame = useCallback(
    (gameId: string) => {
      const { playerId, isAdmin } = games.find(
        (g) => g.gameId === gameId
      ) as IGame;
      setButtonClicked(true);
      dispatch(setGameId(gameId));
      dispatch(setPlayerId(playerId));
      dispatch(setAdmin(isAdmin));
    },
    [dispatch, games]
  );

  const [createNew, setCreateNew] = useState(false);

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
      {games.length > 0 && !createNew && (
        <div>
          {gameNames.length > 0 && (
            <>
              <div>Rejoin existing game</div>
              {gameNames.map((game) => (
                <div key={game.id}>
                  <button onClick={() => onChooseGame(game.id)}>
                    {game.name || game.id}
                  </button>
                </div>
              ))}
            </>
          )}
          <div>
            <div>Create New Game</div>
            <button onClick={() => setCreateNew(true)}>New Game</button>
          </div>
        </div>
      )}
      {(games.length < 1 || createNew) && (
        <form onSubmit={onCreateGame}>
          <h1>Select cardsets for this game</h1>
          <button onClick={onSelectAll}>select all</button>
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
          <button type="submit" disabled={buttonClicked}>
            Create New Game
          </button>
        </form>
      )}
      <hr />
      <div className={classes.notices}>
        <span>Acknowledgements</span>
        <span>
          This clone is not sponsored by Cards Against Humanity&trade; and no
          link or endorsement is implied. The physical game can be purchased at{' '}
          <a href="http://cardsagainsthumanity.com">cardsagainsthumanity.com</a>
          . Cards are recreated under the{' '}
          <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/">
            Creative Commons - Attribution - Noncommercial - Share Alike license
          </a>
          .
        </span>
        <span>
          The idea for this clone came from{' '}
          <a href="https://pretendyoure.xyz/zy/">pretend you're xyzzy</a> and we
          have reused their database scripts.
        </span>
        <span>
          The <Cards className={classes['cards-icon']} /> icon is{' '}
          <a href="https://thenounproject.com/term/cards/165724/">
            Cards by Dmitriy Ivanov from the Noun Project
          </a>
        </span>
        <span>
          The <Crown className={classes['cards-icon']} /> icon is{' '}
          <a href="https://thenounproject.com/term/crown/3204405/">
            Crown by Icon Lauk from the Noun Project
          </a>
        </span>
        <span>
          Both icons used under the{' '}
          <a href="https://creativecommons.org/licenses/by/3.0/us/legalcode">
            Creative Commons CCBY Attribution licence
          </a>
        </span>
      </div>
    </div>
  );
};
