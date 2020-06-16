import {executeQuery} from '../utils/database';
import {PLAYERS} from '../constants';

export const handler = async (event) => {
  let rules = event.body.rules || [];
  const [{uuid, id}] = await executeQuery({
    query: 'insert into game (uuid, name, cardsets, rules, end_state) values (uuid_generate_v4(), $1, $2, $3, $4) returning uuid, id',
    params: [event.body.name, event.body.cardsets, rules, event.body.endState || {}]
  });
  if (rules.includes(1)) {
    await executeQuery({
      query: 'insert into game_player (game, player, answer, cards) VALUES ($1, $2, 10000, $3)',
      params: [id, PLAYERS.RANDO.id, []],
    });
  }
  return {id: uuid};
};
