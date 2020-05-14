import {executeQuery} from '../utils/database';
import AWS from 'aws-sdk';
import {GAME_STATE} from '../constants';
import {sendNotification} from '../utils/notification';
// Set the region
AWS.config.update({region: 'eu-west-2'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const nextRoundQueue = process.env['NEXT_ROUND_QUEUE'];

export const handler = async (event) => {
  console.log('nextRoundQueue:', nextRoundQueue);
  const [{playerId}] = await executeQuery({
    query: `
        update round
        set winner = true
        where game = (select id from game where uuid = $1)
          and $2 = any (cards)
        returning player as "playerId"`,
    params: [event.body.game, event.body.card]
  });
  await executeQuery({
    query: `
        update game_player
        set score = score + 1
        where game = (select id from game where uuid = $1)
          and player = $2`,
    params: [event.body.game, playerId]
  });
  await executeQuery({
    query: `
        update game
        set game_state = $1
        where uuid = $2
        returning id as "gameId"`,
    params: [GAME_STATE.JUDGED, event.body.game]
  });

  const params = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify({game: event.body.game}),
    QueueUrl: nextRoundQueue
  };

  await sendNotification({message:{game: event.body.game}});
  try {
    const sqsStatus = await sqs.sendMessage(params).promise();
    console.log('sent sqs id:', sqsStatus.MessageId);
  } catch (error) {
    console.log('error:', `failed to send message ${error}`);
  }
  // await nextRound(event);
};
