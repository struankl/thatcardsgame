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
import {
  getCardsetsService,
  getGameNames,
  ICardSet,
  IRule,
} from '../../services/game-services';
import { createUseStyles, useTheme } from 'react-jss';
import { ReactComponent as Cards } from '../../icons/cards.svg';
import { ReactComponent as Crown } from '../../icons/crown.svg';
import { Name } from './tabs/Name';
import { CardsSets } from './tabs/Cardsets';
import { HouseRules } from './tabs/HouseRules';
import { EndState } from './tabs/EndState';
import { actions as toastrActions } from 'react-redux-toastr';

const useStyles = createUseStyles({
  form: {
    maxWidth: '900px',
    '& > button': {
      margin: 5,
    },
  },
  subheading: {
    display: 'inline-block',
    marginBottom: 10,
  },
  cardsets: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
  tab: {
    padding: [[10, 5]],
    margin: 5,
    cursor: 'pointer',
    '&.selected': {
      borderBottom: '2px solid white',
    },
  },
  'rules-panel': {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '10px',
  },
  rule: {
    border: '1px solid white',
    borderRadius: 7,
    padding: 7,
    backgroundColor: 'rgba(255,255,255, 0.2)',
  },
  'rule-name': {
    display: 'inline-block',
    textDecoration: 'underline',
    marginBottom: 5,
  },
  'rule-body': {
    display: 'flex',
    alignItems: 'center',
  },
  'rule-description': {
    display: 'inline-block',
    textAlign: 'left',
  },
  'end-state-panel': {
    display: 'flex',
    flexDirection: 'column',
    width: 400,
    margin: 'auto',
    maxWidth: 'calc(100vw - 10px)',
    '& label': {
      display: 'flex',
      justifyContent: 'space-between',
      margin: 5,
    },
    '& input[type="number"]': {
      width: 50,
    },
  },
});

enum TABS {
  NAME = 'Name',
  STOCK_CARDS = 'Stock Cards',
  RULES = 'House Rules',
  END_STATE = 'End State',
}

export const NewGame: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const dispatch = useDispatch();
  const [buttonClicked, setButtonClicked] = useState(false);
  const [cardsets, setCardsets] = useState<ICardSet[]>([]);
  const [rules, setRules] = useState<IRule[]>([]);
  const [name, setName] = useState('');
  const [gameNames, setGameNames] = useState<{ id: string; name: string }[]>(
    []
  );
  const [endState, setEndState] = useState({
    duration: 0,
    rounds: 0,
    score: 0,
  });

  const [selectedTab, setSelectedTab] = useState(TABS.NAME);

  let tabValues = Object.values(TABS);
  const isFirstTab = selectedTab === tabValues[0];
  const isLastTab = selectedTab === tabValues[tabValues.length - 1];

  const games = useMemo<IGame[]>(
    () =>
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]') as IGame[],
    []
  );

  useEffect(() => {
    getCardsetsService().then((response) => {
      setCardsets(response.cardsets.map((r) => ({ ...r, selected: false })));
      setRules(response.rules.map((r) => ({ ...r, selected: false })));
    });
  }, []);

  useEffect(() => {
    getGameNames(games.map(({ gameId }) => gameId)).then((response) =>
      setGameNames(response)
    );
  }, [games]);

  const onCreateGame = (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLastTab) {
        gotoNextTab();
        return;
      }
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
          rules: rules.filter(({ selected }) => selected).map(({ id }) => id),
          endState
        })
      );
    };

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

  const gotoNextTab = () => {
    let result;
    switch (selectedTab) {
      case TABS.NAME:
        result = {
          valid: Boolean(name),
          message: 'Please choose a name for the game',
        };
        break;
      case TABS.STOCK_CARDS:
        result = {
          valid: cardsets.filter(({ selected }) => selected).length > 0,
          message: 'Please select at least one cardset',
        };
        break;
      default:
        result = {
          valid: true,
          message: '',
        };
    }

    dispatch(toastrActions.remove('setup-error'));
    if (!result.valid) {
      dispatch(
        toastrActions.add({
          id: 'setup-error',
          title: 'Error',
          message: result.message,
          type: 'error',
        })
      );
    }
    return setSelectedTab(
      result.valid ? tabValues[tabValues.indexOf(selectedTab) + 1] : selectedTab
    );
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
        <form className={classes.form} onSubmit={onCreateGame}>
          {selectedTab === TABS.NAME && (
            <Name name={name} setName={setName} classes={classes} />
          )}
          {selectedTab === TABS.STOCK_CARDS && (
            <CardsSets
              cardsets={cardsets}
              setCardsets={setCardsets}
              classes={classes}
            />
          )}
          {selectedTab === TABS.RULES && (
            <HouseRules rules={rules} setRules={setRules} classes={classes} />
          )}
          {selectedTab === TABS.END_STATE && (
            <EndState
              endStates={endState}
              setEndStates={setEndState}
              classes={classes}
            />
          )}
          <button
            type="button"
            disabled={isFirstTab}
            onClick={() =>
              setSelectedTab(
                (currentTab) => tabValues[tabValues.indexOf(currentTab) - 1]
              )
            }
          >
            Previous
          </button>
          {!isLastTab && (
            <button type="button" onClick={gotoNextTab}>
              Next
            </button>
          )}
          {isLastTab && (
            <button type="submit" disabled={buttonClicked}>
              Create New Game
            </button>
          )}
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
        <span>
          If you believe there are any infringements on any rights please
          contact{' '}
          <a href="mailto:admin@thatcardsgame.com">admin@thatcardsgame.com</a>
        </span>
      </div>
    </div>
  );
};
