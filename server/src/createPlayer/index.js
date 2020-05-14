import {executeQuery} from '../utils/database';

export const handler = async (event) => {
  console.log(JSON.stringify(event));
  const result = await executeQuery({
    query: 'insert into player (name) values ($1) returning uuid, name',
    params: [event.body.name]
  });
  return {id: result[0].uuid, name: result[0].name};
};
