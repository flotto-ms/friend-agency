import TokenUtils, { TokenType } from "../TokenUtils";
import MainConnection, { GetNewExchangeDataResponse } from "./MainConnection";

const getQuests = async (userId: number, type: TokenType = "bot") => {
  return await TokenUtils.getToken(type)
    .then(MainConnection.createConnection)
    .then((c) => {
      return c
        .getNewExchangeData(userId)
        .then(parseResponse)
        .catch((e) => {
          console.error(e);
          return [];
        })
        .finally(() => c.close());
    });
};

const parseResponse = (response: GetNewExchangeDataResponse) => {
  const user = response.buyerInfo;
  if (!user.items) {
    return [];
  }

  const quests = response.friendQuestData;
  const questIds = Object.entries(user.items)
    .filter(([key, value]) => key.length > 9 && key.startsWith("41") && (value as number) > 0)
    .map(([key]) => parseInt(key.substring(2)));

  return questIds.map((id) => quests[id]);
};

export default {
  getQuests,
};
