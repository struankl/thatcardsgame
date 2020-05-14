import {executeQuery} from '../utils/database';
import {dealCards} from '../utils/dealHand';
import {NUMBER_OF_CARDS} from '../constants';

export const handler = async (event) => {

  const [{gameId}] = await executeQuery({
    query: `select g.id as "gameId"
            from game g
            where g.uuid = $1`,
    params: [event.body.game]
  });
  const {cards} = await dealCards(gameId, NUMBER_OF_CARDS);
  await executeQuery({
    query: `
        insert into game_player (game, player, answer, cards)
        values ((select id from game where uuid = $1), (select id from player where uuid = $2), $3, $4)`,
    params: [event.body.game, event.body.player, event.body.answer, cards.map(({card}) => card)]
  });
};
