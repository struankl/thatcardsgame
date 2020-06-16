import { executeQuery } from "../utils/database";
import { sendNotification } from "../utils/notification";
import { dealCards } from "../utils/dealHand";
import { GAME_STATE, NUMBER_OF_CARDS, PLAYERS, RULES } from "../constants";

const doNextRound = async (event, redealOnly = false) => {
  const [{ gameId, rules }] = await executeQuery({
    query: `select g.id as "gameId", g.rules
            from game g
            where g.uuid = $1`,
    params: [event.body.game],
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
      `,
      params: [gameId],
    });

    if (newCardResult.length < 1) {
      await executeQuery({
        query: "delete from black_cards_played where game = $1",
        params: [gameId],
      });
    }
  }

  const [{ card: newCard }] = newCardResult;

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
              order by answer`,
    params: [gameId],
  });

  let nextCzarId = null;
  let lastRoundPlayedCards = null;
  if (!redealOnly) {
    lastRoundPlayedCards = await executeQuery({
      query: `
            select r.player, r.cards, r.winner
            from round r
            where r.game = $1`,
      params: [gameId],
    });

    if (rules.includes(RULES.MERITOCRACY)) {
      const lastWinner = lastRoundPlayedCards.find(({ winner }) => winner);
      if (lastWinner && lastWinner.player !== PLAYERS.RANDO.id) {
        nextCzarId = lastWinner.player;
      }
      console.log('Meritocracy - next czar:', nextCzarId);
    }
    if (!rules.includes(RULES.MERITOCRACY) || !nextCzarId) {
      const activePlayers = players.filter(p => p.isActive);
      let czarIndex = activePlayers.findIndex((p) => p.isCzar);
      if (!czarIndex && czarIndex !== 0) {
        czarIndex = -1;
      }
      const nextCzar = activePlayers[(czarIndex + 1) % activePlayers.length]
      console.log("next czar:", czarIndex, JSON.stringify(nextCzar));
      nextCzarId = nextCzar.player;
      console.log('Not Meritocracy - next czar:', nextCzarId);
    }
  }

  await executeQuery({
    query: `update game
            set current_black_card = $1,
                game_state         = $2,
                round              = round + $4,
                czar               = coalesce($5, czar),
                round_end          = null,
                last_round_start   = now(),
                game_start         = coalesce(game_start, now())
            where id = $3
            returning round`,
    params: [
      newCard,
      GAME_STATE.PLAYING,
      gameId,
      redealOnly ? 0 : 1,
      nextCzarId,
    ],
  });

  if (!redealOnly) {
    const { cards: newCards } = await dealCards(
      gameId,
      lastRoundPlayedCards.reduce((acc, { cards }) => acc + cards.length, 0)
    );
    await Promise.all(
      players.map(async ({ player, cards }, index) => {
        const playedCards = (
          lastRoundPlayedCards.find((lrpc) => lrpc.player === player) || {
            cards: [],
          }
        ).cards;
        const playersCards = [
          ...cards.filter((card) => !playedCards.includes(card)),
        ];
        playersCards.push(
          ...newCards
            .splice(0, NUMBER_OF_CARDS - playersCards.length)
            .map(({ card }) => card)
        );

        await executeQuery({
          query:
            "update game_player set cards = $1 where game = $2 and player = $3",
          params: [playersCards, gameId, player],
        });
      })
    );
  }
  await executeQuery({
    query: "delete from round where game = $1",
    params: [gameId],
  });

  if (rules.includes(RULES.RANDO_CARDARIAN)) {
    const [{ pick }] = await executeQuery({
      query: `select bc.pick from black_cards bc, game g
              where g.id = $1
              and bc.id = g.current_black_card`,
      params: [gameId],
    });
    const { cards: randosCards } = await dealCards(gameId, pick);
    await executeQuery({
      query: `insert into round (game, player, cards) values ($1, $2, $3)`,
      params: [gameId, PLAYERS.RANDO.id, randosCards.map(({ card }) => card)],
    });
  }

  await sendNotification({ message: { game: event.body.game } });
};

export const handler = async (event) => {
  console.log("got event:", JSON.stringify(event));
  if (event.body) {
    const { redealOnly = false } = event.query || {};
    return doNextRound(event, redealOnly);
  }
  if (event.Records) {
    return Promise.all(
      event.Records.map(({ Sns = {} }) =>
        doNextRound({ body: JSON.parse(Sns.Message || "") })
      )
    );
  }
};
