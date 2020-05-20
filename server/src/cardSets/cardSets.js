import { executeQuery } from "../utils/database";

export const handler = async () => {
  const [cardsets, rules] = await Promise.all([executeQuery({
      query:
        "select cs.name, cs.id, cs.weight from card_set cs where cs.active = true order by weight",
    }),
    executeQuery({
      query:
        "select hr.id, hr.name, hr.description from house_rules hr order by id",
    })]);
  return {cardsets, rules};
};
