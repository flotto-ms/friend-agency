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

export const getUserSentQuestsDate = async (userId: number, date: Date) => {
  const from = new Date(date.getTime());
  from.setDate(from.getDate() + 3);
  const to = new Date(from.getTime());
  to.setDate(to.getDate() + 1);

  const sentQuery: QueryCommandInput = {
    TableName: process.env.SENT_QUESTS_TABLE,
    IndexName: "UserIdExpiresAtIndex",
    KeyConditionExpression: "userId = :userId AND expiresAt BETWEEN :from AND :to",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":from": from.toISOString().substring(0, 10),
      ":to": to.toISOString().substring(0, 10),
    },
  };
  return queryItemsInput<SentQuestTableItem>(sentQuery);
};
