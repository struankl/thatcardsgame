import {executeQuery} from '../utils/database';
import AWS from 'aws-sdk';
import {sendNotification} from '../utils/notification';
// Set the region
AWS.config.update({region: 'eu-west-2'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const notificationsQueue = process.env[`NOTIFICATIONS_QUEUE`];

export const handler = async (event) => {
  await executeQuery({
    query: `
        update game
        set round_end = $1::timestamp + interval '10 second'
        where uuid = $2
        and round = $3
        returning id as "gameId"`,
    params: [new Date(), event.body.game, event.body.round]
  });

  const params = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify({game: event.body.game}),
    QueueUrl: notificationsQueue
  };

  await sendNotification({message:{game: event.body.game}});
  try {
    const sqsStatus = await sqs.sendMessage(params).promise();
    console.log('sent sqs id:', sqsStatus.MessageId);
  } catch (error) {
    console.log('error:', `failed to send message ${error}`);
  }
};
