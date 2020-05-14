import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import debounce from 'lodash/debounce';
import { reducer as toastrReducer } from 'react-redux-toastr';
import { gameStateReducers, IGameState } from './game-state/gameStateReducers';
import {
  localStateReducers,
  ILocalState,
} from './local-state/localStateReducers';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import * as gameStateEpics from '../effects/gameStateEffects';
import * as gameStateSelectors from './game-state/gameStateSelectors';
import * as localStateSelectors from './local-state/localStateSelectors';

export type AppState = {
  gameState: IGameState;
  localState: ILocalState;
};

const reducers = combineReducers({
  gameState: gameStateReducers,
  localState: localStateReducers,
  toastr: toastrReducer,
});

const epicMiddleware = createEpicMiddleware();
console.log('Preparing for use in ', process.env.NODE_ENV);
const middleware =
  process.env.NODE_ENV === 'production'
    ? compose(applyMiddleware(epicMiddleware))
    : composeWithDevTools(applyMiddleware(epicMiddleware));
export const LOCAL_STORAGE_WRITE_DELAY = 100;
export const LOCAL_STORAGE_KEY = 'desks-contrary-to-civilization-store';

const deserialiseState = (): AppState => {
  const sessionStorageState = sessionStorage.getItem(LOCAL_STORAGE_KEY);
  // @ts-ignore
  return sessionStorageState
    ? { localState: JSON.parse(sessionStorageState).localState, gameState: {} }
    : {};
};

const serialiseState = (): AppState => {
  const state: AppState = store.getState();
  sessionStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ localState: state.localState })
  );
  return state;
};

// Set up store
const rehydratedState = deserialiseState();

// @ts-ignore
export const store = createStore(reducers, rehydratedState, middleware);
store.subscribe(debounce(serialiseState, LOCAL_STORAGE_WRITE_DELAY));
export const selectors = {
  ...localStateSelectors,
  ...gameStateSelectors,
};

const epics = combineEpics(...Object.values(gameStateEpics));
// @ts-ignore
epicMiddleware.run(epics);
