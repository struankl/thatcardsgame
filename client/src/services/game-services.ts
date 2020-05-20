import { SERVER_URL } from '../constants';

export interface ICardSet {
  name: string;
  id: number;
  weight: number;
  selected: boolean;
}

export interface IRule {
  id: number;
  name: string;
  description: string;
  selected: boolean;
}

interface IStartGameResponse {
  uuid: string;
}

export const createGameService = async ({
  name,
  cardsets,
    rules
}: {
  name: string;
  cardsets: number[];
  rules: number[];
}): Promise<IStartGameResponse> => {
  const response = await fetch(`${SERVER_URL}/game`, {
    method: 'POST',
    body: JSON.stringify({ name, cardsets, rules }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const { id } = await response.json();
  return { uuid: id };
};

export const startGameService = async (gameId: string): Promise<void> => {
  await fetch(`${SERVER_URL}/round`, {
    method: 'POST',
    body: JSON.stringify({ game: gameId }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

interface ICreatePlayerResponse {
  playerId: string;
}

interface ICreatePlayerParams {
  name: string;
  gameId: string;
  lastPoop: number;
}

export const createPlayerService = async ({
  name,
  gameId,
  lastPoop,
}: ICreatePlayerParams): Promise<ICreatePlayerResponse> => {
  const response = await fetch(`${SERVER_URL}/player`, {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const { id: playerId } = await response.json();
  await fetch(`${SERVER_URL}/join`, {
    method: 'POST',
    body: JSON.stringify({ player: playerId, game: gameId, answer: lastPoop }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return { playerId };
};

export const playCardsService = async ({
  gameId,
  playerId,
  cards,
}: {
  gameId: string;
  playerId: string;
  cards: string[];
}): Promise<void> => {
  await fetch(`${SERVER_URL}/play`, {
    method: 'POST',
    body: JSON.stringify({ game: gameId, player: playerId, cards }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const sendWinnerService = async ({
  gameId,
  card,
}: {
  gameId: string;
  card: string;
}): Promise<void> => {
  await fetch(`${SERVER_URL}/score`, {
    method: 'POST',
    body: JSON.stringify({ game: gameId, card }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const sendEndRoundService = async ({
  gameId,
  round,
}: {
  gameId: string;
  round: number;
}): Promise<void> => {
  await fetch(`${SERVER_URL}/endround`, {
    method: 'POST',
    body: JSON.stringify({ game: gameId, round }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getCardsetsService = async (): Promise<{cardsets: ICardSet[], rules: IRule[]}> => {
  const response = await fetch(`${SERVER_URL}/cardsets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

export const getGameNames = async (
  gameIds: string[]
): Promise<{ id: string; name: string }[]> => {
  const response = await fetch(
    `${SERVER_URL}/gamenames?gameIds=${gameIds
      .map(encodeURIComponent)
      .join(',')}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const results = (await response.json()) as { id: string; name: string }[];
  if (!results || !results.length) {
    console.log('got no game names');
    return [];
  }
  return results;
};

export const redealBlackService = async ({
  gameId,
}: {
  gameId: string;
}): Promise<void> => {
  await fetch(`${SERVER_URL}/round?redealOnly=true`, {
    method: 'POST',
    body: JSON.stringify({ game: gameId }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
