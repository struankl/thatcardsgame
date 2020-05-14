import {executeQuery} from '../utils/database';
import {sendNotification} from '../utils/notification';
import {dealCards} from '../utils/dealHand';
import {GAME_STATE, NUMBER_OF_CARDS} from '../constants';

const doNextRound = async (event, redealOnly = false) => {
  const [{gameId}] = await executeQuery({
    query: `select g.id as "gameId"
            from game g
            where g.uuid = $1`,
    params: [event.body.game]
  });

  let newCardResult = [];

  while (newCardResult.length < 1) {
    newCardResult = await executeQuery({
      query: `insert into black_cards_played (game, card)
                  (select $1, bc.id
                   from black_cards bc,
                        card_set_black_card csbc,
                        card_set cs
                   where bc.id = csbc.black_card_id
                     and csbc.card_set_id = cs.id
                     and cs.id IN (select unnest(cardsets) from game g where g.id = $1)
                     and bc.id not in (select card from black_cards_played where game = $1)
                   order by random()
                   limit 1)
              returning card;
      `, params: [gameId]
    });

    if (newCardResult.length < 1) {
      await executeQuery({
        query: 'delete from black_cards_played where game = $1',
        params: [gameId]
      });
    }
  }

  const [{card: newCard}] = newCardResult;

  const players = await executeQuery({
    query: `with czar as (select g.czar from game g where g.id = $1)
            select gp.player,
                   gp.score,
                   coalesce(gp.cards, '{}'::int[]) as cards,
                   p.name,
                   case 
                       when w.connection_id is null then false
                       else true
                   end as "isActive",
                   p.id = (select czar from czar) as "isCzar"
              from game_player gp,
                   player p
              left outer join websockets w on p.id = w.player 
              where gp.game = $1
                and p.id = gp.player
              order by answer`, params: [gameId]
  });

  let nextCzarId = null;
  if (!redealOnly) {
    let czarIndex = players.findIndex(p => p.isCzar);
    if (!czarIndex && czarIndex !== 0) {
      czarIndex = -1;
    }

    console.log('selecting next czar from: ', JSON.stringify([...players, ...players].slice(czarIndex + 1).filter(p => p.isActive)));
    const nextCzar = [...players, ...players].slice(czarIndex + 1).filter(p => p.isActive)[0];
    console.log('next czar:', czarIndex, JSON.stringify(nextCzar));
    nextCzarId = nextCzar ? nextCzar.player : players[(czarIndex + 1) % players.length].player;
  }

  await executeQuery({
    query: `update game
            set current_black_card = $1,
                game_state         = $2,
                round              = round + $4,
                czar               = coalesce($5, czar),
                round_end          = null
            where id = $3
            returning round`,
    params: [newCard, GAME_STATE.PLAYING, gameId, redealOnly ? 0 : 1, nextCzarId]
  });

  if (!redealOnly) {
    const lastRoundPlayedCards = await executeQuery({
      query: `
            select r.player, r.cards
            from round r
            where r.game = $1`,
      params: [gameId]
    });
    const {cards: newCards} = await dealCards(gameId, lastRoundPlayedCards.reduce((acc, {cards}) => acc + cards.length, 0));
    await Promise.all(players.map(async ({player, cards}, index) => {
      const playedCards = (lastRoundPlayedCards.find(lrpc => lrpc.player === player) || {cards: []}).cards;
      const playersCards = [...cards.filter(card => !playedCards.includes(card))];
      playersCards.push(...newCards.splice(0, NUMBER_OF_CARDS - playersCards.length).map(({card}) => card));

      await executeQuery({
        query: 'update game_player set cards = $1 where game = $2 and player = $3',
        params: [playersCards, gameId, player]
      });

    }));
  }
  await executeQuery({query: 'delete from round where game = $1', params: [gameId]});

  await sendNotification({message: {game: event.body.game}});
};

export const handler = async (event) => {
  console.log('got event:', JSON.stringify(event));
  if (event.body) {
    const {redealOnly = false} = event.query || {};
    return doNextRound(event, redealOnly);
  }
  if (event.Records) {
    return Promise.all(event.Records.map(({body}) => doNextRound({body: JSON.parse(body)})));
  }
};
