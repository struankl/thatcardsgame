import {executeQuery} from '../utils/database';

export const handler = async () => {
  return  executeQuery({query: 'select cs.name, cs.id, cs.weight from card_set cs where cs.active = true order by weight'})
};
