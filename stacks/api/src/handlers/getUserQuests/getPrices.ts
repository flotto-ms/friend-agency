import { ReceivedQuestTableItem, SentQuestTableItem } from "@flotto/types";
import { queryItems } from "../../utils/DynamoDbUtils";

export const getUserQuestPrices = async (userId: number) => {
  const received = await queryItems<ReceivedQuestTableItem>({
    KeyCondition: { userId },
    TableName: process.env.RECEIVED_QUESTS_TABLE!,
  }).then((items) => items.filter((item) => item.flotto).map((item) => ({ id: item.id, flotto: item.flotto })));

  const sent = await queryItems<SentQuestTableItem>({
    KeyCondition: { userId },
    TableName: process.env.SENT_QUESTS_TABLE!,
  }).then((items) => items.filter((item) => item.flotto).map((item) => ({ id: item.id, flotto: item.flotto })));

  return {
    received,
    sent,
  };
};
