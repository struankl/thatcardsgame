import {executeQuery} from '../utils/database';
import {sendNotification} from '../utils/notification';
import {GAME_STATE} from '../constants';

export const handler = async (event) => {
  const [{gameId, playerId}] = await executeQuery({
    query: `select g.id as "gameId", p.id as "playerId" from 
                       (select id from game where uuid = $1) g,
                       (select id from player where uuid = $2) p`,
    params: [event.body.game, event.body.player]
  });
  await executeQuery({
    query: 'delete from round where game = $1 and player = $2',
    params: [gameId,playerId]
  });
  await executeQuery({
    query: 'insert into round (game, player, cards) values ($1, $2, $3)',
    params: [gameId,playerId, event.body.cards]
  });

  const [{played, playing}] = await executeQuery({
    query: `
        select played.count as played, players.count as playing
        from (select count(*) as count from round where game = $1) played,
             (select count(*) as count from game_player where game = $1) players`,
    params: [gameId]
  });

  if (parseInt(played) === parseInt(playing) - 1) {
    await executeQuery({
      query: 'update game set game_state = $1 where id = $2',
      params: [GAME_STATE.JUDGING,gameId]
    });
  }

  await sendNotification({message: {game: event.body.game}});
};
