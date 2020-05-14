// eslint-disable-next-line import/no-extraneous-dependencies
import AWS from 'aws-sdk';
import { executeQuery } from '../utils/database';
import {GAME_STATE} from '../constants';

const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: '2grm03xuhe.execute-api.eu-west-2.amazonaws.com/dev',
});

export const doNotify = async (message) => {
  const { game, player } = message;
  const [{gameId, playerId}] = player ?
    await executeQuery({
      query: `select g.id as "gameId", p.id as "playerId" from 
                       (select id from game where uuid = $1) g,
                       (select id from player where uuid = $2) p`,
      params: [game, player]
  }) :
    await executeQuery({
      query: `select g.id as "gameId" from 
                       (select id from game where uuid = $1) g`,
      params: [game]
    });

  const connections = await executeQuery({
    query: 'select connection_id as "connectionId", player from websockets where game = $1',
    params: [gameId]
  });
  if (connections.length < 1) {
    console.log('no websockets found for game', game, gameId);
    return;
  }
  if (player && !connections.find(({player: p}) => p === player)) {
    console.log('no websocket found for game', game, 'player', player);
    return;
  }

  const [{id: blackCardId,
    pick,
    message: blackCardMessage,
    watermark,
    round,
    gameState: playingState,
    roundEndTime,
    czar,
  } = {}] = await executeQuery({
    query: `
select bc.id, bc.pick, bc.text as message, bc.watermark, g.round, g.game_state as "gameState", g.round_end as "roundEndTime", g.czar
from game g
left join black_cards bc on bc.id = g.current_black_card
where g.id = $1`,
    params: [gameId]
  });
  let gameState = playingState;
  if (roundEndTime && gameState === 'playing' && roundEndTime < Date.now()) {
    console.log('Ending round because end time set to', roundEndTime);
    gameState = 'judging';
    await executeQuery({
      query: `update game set game_state = 'judging' where id = $1`,
      params: [gameId],
    });
  }
  const players = await executeQuery({
    query: `select gp.player,
                   gp.score,
                   coalesce(gp.cards, '{}'::int[]) as cards,
                   p.name,
                   p.uuid,
                   r.cards as "playedCards",
                   case 
                        when w.connection_id is null then false
                        else true
                   end as "isActive"
            from game_player gp,
                 player p
                 left join round r on p.id = r.player and r.game = $1
                 left join websockets w on p.id = w.player and w.game = $1
            where gp.game = $1
              and p.id = gp.player
            order by answer`, params: [gameId]
  });

  const playerStates = players.map((p, index) => ({
    name: p.name,
    score: p.score,
    isCzar: czar === p.player,
    hasPlayed: !!p.playedCards && p.playedCards.length > 0,
    isActive: p.isActive
  }));
  let playedCards = null;
  let winner = null;
  if (gameState === GAME_STATE.JUDGING) {
    const s = await executeQuery({
      query: 'select r.player, r.cards, r.rand from round r where r.game = $1 order by r.rand',
      params: [gameId]
    });
    const pc = await executeQuery({
      query: 'select wc.id, wc.text as message, wc.watermark from round r, white_cards wc where game = $1 and wc.id = ANY(r.cards) order by random()',
      params: [gameId]
    });
    playedCards = s.map(({ cards }) => cards.map((cardId) => pc.find(({id}) => id === cardId)));
  }
  if (gameState === GAME_STATE.JUDGED) {
    const s = await executeQuery({
      query: `select r.player, r.cards, p.name 
                from round r,
                     player p
               where r.game = $1
                 and p.id = r.player
                 and r.winner = true`,
      params: [gameId]
    });
    const pc = await executeQuery({
      query: 'select wc.id, wc.text as message, wc.watermark from round r, white_cards wc where game = $1 and wc.id = ANY(r.cards) order by random()',
      params: [gameId]
    });
    playedCards = s.map(({ cards }) => cards.map((cardId) => pc.find(({id}) => id === cardId)));
    winner = s[0].name;
  }

  await Promise.all((playerId ? [{player: playerId}] : players).map(async targetPlayer => {
    const connection = connections.find(({player: p}) => p === targetPlayer.player);
    if (!connection) {
      console.log('no connection for player', targetPlayer.player);
      return;
    }
    console.log('trying to find', targetPlayer, 'in', players);
    const playerIndex = players.findIndex(({player: p}) => p === targetPlayer.player);
    console.log('playerIndex', playerIndex);
    const whiteCards = await executeQuery({
      query: 'select id, text as message, watermark from white_cards where id = ANY($1)',
      params: [players[playerIndex].cards]
    });
    const isCzar = targetPlayer.player === czar;

    const {connectionId} = connection;

    const playerGameState = gameState === GAME_STATE.PLAYING && players[playerIndex].playedCards ? GAME_STATE.PLAYED : gameState;
    console.log('player:', JSON.stringify(players[playerIndex]), 'gameState:', playerGameState, Boolean(players[playerIndex].playedCards));
    const data = JSON.stringify({
      gameState: playerGameState,
      round,
      gameId: game,
      playerId: targetPlayer.player,
      isCzar,
      ...(playedCards && {playedCards}),
      ...(winner && {winner}),
      blackCard: blackCardId ? {
        id: blackCardId,
        pick,
        message: blackCardMessage,
        watermark
      } : null,
      whiteCards,
      players: playerStates,
      ...(roundEndTime && {roundEndTime})
    });
    console.log('sending data', data, 'to: ', connectionId);
    await apigwManagementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: data,
      }).promise()
      .catch((e) => {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          return executeQuery({
            query: `delete
                    from websockets
                    where connection_id = $1`,
            params: [connectionId],
          });
        }
        console.log('got error: ', e);
        return true;
      });
  }));
};


export const handler = async (event) => {
  console.log('got event:', JSON.stringify(event));
  if (event.body) {
    return doNotify(event.body);
  }
  if (event.Records) {
    return Promise.all(event.Records.map((record) => {
      const message = JSON.parse(record.Sns ? record.Sns.Message : record.body);
      console.log('Message received from SNS or SQS:', JSON.stringify(message));
      return doNotify(message);
    }));
  }
};
