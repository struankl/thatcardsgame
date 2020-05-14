import {executeQuery} from './database';

export const dealCards = async (gameId, requiredNumber) => {
  const cards = [];
  let shuffled = false;
  while (cards.length < requiredNumber) {
    const newCards = await executeQuery({
      query: `insert into white_cards_played (game, card)
                  (select $1, wc.id
                   from white_cards wc,
                        card_set_white_card cswc,
                        card_set cs
                   where wc.id = cswc.white_card_id
                     and cswc.card_set_id = cs.id
                     and cs.id IN (SELECT unnest(cardsets) from game g where g.id = $1)
                     and wc.id not in (select card from white_cards_played wcp where wcp.game = $1)
                   order by random()
                   limit $2)
              returning card;
      `, params: [gameId, requiredNumber]
    });
    cards.push(...newCards);
    if (cards.length < requiredNumber) {
      await executeQuery({
        query: `delete from white_cards_played where game = $1`,
        params: [gameId]
      });
      shuffled = true;
    }
  }
  return {cards, shuffled};
};
