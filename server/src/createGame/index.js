import {executeQuery} from '../utils/database';

export const handler = async (event) => {
  const [{uuid}] = await executeQuery({
    query: 'insert into game (uuid, name, cardsets) values (uuid_generate_v4(), $1, $2) returning uuid',
    params: [event.body.name, event.body.cardsets]
  });
  return {id: uuid};
};
