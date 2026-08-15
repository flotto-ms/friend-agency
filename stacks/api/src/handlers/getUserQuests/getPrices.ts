import { ReceivedQuestTableItem, SentQuestTableItem } from "@flotto/types";
import { queryItems, queryItemsInput } from "../../utils/DynamoDbUtils";
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const date = "2026-06-01";

export const getUserQuestPrices = async (userId: number) => {
  const receivedQuery: QueryCommandInput = {
    TableName: process.env.RECEIVED_QUESTS_TABLE,
    IndexName: "UserIdCreatedAtIndex",
    KeyConditionExpression: "userId = :userId AND createdAt > :date",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":date": date,
    },
  };

  const sentQuery: QueryCommandInput = {
    TableName: process.env.SENT_QUESTS_TABLE,
    IndexName: "UserIdExpiresAtIndex",
    KeyConditionExpression: "userId = :userId AND expiresAt > :date",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":date": date,
    },
  };

  const received = await queryItemsInput<ReceivedQuestTableItem>(receivedQuery).then((items) =>
    items.filter((item) => item.flotto).map((item) => ({ id: item.id, flotto: item.flotto })),
  );
  const sent = await queryItemsInput<SentQuestTableItem>(sentQuery).then((items) =>
    items.filter((item) => item.flotto).map((item) => ({ id: item.id, flotto: item.flotto })),
  );

  return {
    received,
    sent,
  };
};
