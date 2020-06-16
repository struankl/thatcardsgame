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
  const [{ score: playerScore }] = await executeQuery({
    query: `
        update game_player
        set score = score + 1
        where game = (select id from game where uuid = $1)
          and player = $2
        returning score`,
    params: [event.body.game, playerId],
  });
  const [{ endState = {}, gameStartTime, round, now }] = await executeQuery({
    query: `
        update game
        set game_state = $1
        where uuid = $2
        returning id as "gameId", end_state as "endState", game_start as "gameStartTime", round, now() as now`,
    params: [GAME_STATE.JUDGED, event.body.game],
  });

  const isLastRound = endState.rounds === round + 1;
  const playerHasWon = endState.score === playerScore;
  const gameOverTime =
    endState.duration &&
    gameStartTime.getTime() + endState.duration * 60000 < now.getTime();
  const gameEnded = isLastRound || playerHasWon || gameOverTime;

  let message = { game: event.body.game };
  await Promise.all([
    sendNotification({ message }),
    gameEnded
      ? sendNotification({
          message: { game: event.body.game, isLastRound, playerHasWon, gameOverTime},
          topic: 'END_GAME_TOPIC',
          delay: 10,
        })
      : sendNotification({
          message,
          topic: 'NEXT_ROUND_TOPIC',
          delay: 10,
        }),
  ]);
};
