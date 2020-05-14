import {executeQuery} from '../utils/database';

export const handler = async (event) => {
  const gameIds = (event.query.gameIds || '').split(',').map(decodeURIComponent);
  return executeQuery({
    query: 'select uuid as id, name from game where uuid = ANY($1)',
    params: [gameIds]
  })
};
