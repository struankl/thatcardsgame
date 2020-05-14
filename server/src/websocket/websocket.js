import { executeQuery } from '../utils/database';
import {sendNotification} from '../utils/notification';

export const disconnect = async ({ requestContext: { connectionId } }) => {
  const [{uuid: gameId} = {}] = await executeQuery({
    query: `delete from websockets w where w.connection_id = $1 returning (select uuid from game g where g.id = w.game)`,
    params: [connectionId],
  });
  if (gameId) {
    await sendNotification({message: {game: gameId}});
  }
};

export const subscribe = async (event) => {
  console.log('got message:', event);
  const { player, game } = JSON.parse(event.body);
  const { requestContext: { connectionId } } = event;
  await executeQuery({
    query: `delete from websockets 
            where player = (select id from player where uuid = $1)
              and game = (select id from game where uuid = $2)`,
    params: [player, game] });


  await executeQuery({
    query: `insert into websockets (connection_id, player, game) 
            values ($1,
                    (select id from player where uuid = $2),
                    (select id from game where uuid = $3))`,
    params: [connectionId, player, game],
  });

  await sendNotification({message: {game}});

  return { statusCode: 200, body: 'Subscription success' };
};
