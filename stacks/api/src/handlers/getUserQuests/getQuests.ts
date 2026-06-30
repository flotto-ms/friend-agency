import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { queryItemsInput } from "../../utils/DynamoDbUtils";
import { ReceivedQuestTableItem, SentQuestTableItem } from "@flotto/types";

const date = "2026-06-01";

export const getUserReceivedQuests = async (userId: number) => {
  const receivedQuery: QueryCommandInput = {
    TableName: process.env.RECEIVED_QUESTS_TABLE,
    IndexName: "UserIdCreatedAtIndex",
    KeyConditionExpression: "userId = :userId AND createdAt > :date",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":date": date,
    },
  };

  return queryItemsInput<ReceivedQuestTableItem>(receivedQuery);
};

export const getUserSentQuests = async (userId: number) => {
  const sentQuery: QueryCommandInput = {
    TableName: process.env.SENT_QUESTS_TABLE,
    IndexName: "UserIdExpiresAtIndex",
    KeyConditionExpression: "userId = :userId AND expiresAt > :date",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":date": date,
    },
  };
  return queryItemsInput<SentQuestTableItem>(sentQuery);
};
