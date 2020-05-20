import { executeQuery } from "../utils/database";
import { sendNotification } from "../utils/notification";

export const handler = async (event) => {
  await executeQuery({
    query: `
        update game
        set round_end = $1::timestamp + interval '10 second'
        where uuid = $2
        and round = $3
        returning id as "gameId"`,
    params: [new Date(), event.body.game, event.body.round],
  });

  await sendNotification({ message: { game: event.body.game } });
  await sendNotification({ message: { game: event.body.game }, delay: 10 });
};
