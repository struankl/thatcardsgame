import { executeQuery } from "../utils/database";
import { GAME_STATE } from "../constants";
import { sendNotification } from "../utils/notification";

export const handler = async (event) => {
  const [{ playerId }] = await executeQuery({
    query: `
        update round
        set winner = true
        where game = (select id from game where uuid = $1)
          and $2 = any (cards)
        returning player as "playerId"`,
    params: [event.body.game, event.body.card],
  });
  await executeQuery({
    query: `
        update game_player
        set score = score + 1
        where game = (select id from game where uuid = $1)
          and player = $2`,
    params: [event.body.game, playerId],
  });
  await executeQuery({
    query: `
        update game
        set game_state = $1
        where uuid = $2
        returning id as "gameId"`,
    params: [GAME_STATE.JUDGED, event.body.game],
  });

  let message = { game: event.body.game };
  await Promise.all([
    sendNotification({ message }),
    sendNotification({ message, topic: "NEXT_ROUND_TOPIC", delay: 10 }),
  ]);
};
