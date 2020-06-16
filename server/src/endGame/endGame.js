import { executeQuery } from "../utils/database";
import { sendNotification } from "../utils/notification";
import { dealCards } from "../utils/dealHand";
import { GAME_STATE, NUMBER_OF_CARDS, PLAYERS, RULES } from "../constants";

const endGame = async (event) => {
  const { isLastRound = false, playerHasWon = false, gameOverTime = false, game } = event.body;
  await executeQuery({
    query: `
        update game
        set game_state = $1,
            end_state = jsonb_set(end_state, '{reason}', $2)
        where uuid = $3`,
    params: [GAME_STATE.ENDED, { isLastRound, playerHasWon, gameOverTime }, game],
  });

  await sendNotification({ message: { game: event.body.game } });
};

export const handler = async (event) => {
  if (event.Records) {
    return Promise.all(
      event.Records.map(({ Sns = {} }) =>
        endGame({ body: JSON.parse(Sns.Message || "") })
      )
    );
  }
};
