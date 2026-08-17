import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { queryItemsInput } from "../DynamoDbUtils";
import { ReceivedQuestTableItem, SentQuestTableItem } from "@flotto/types";

const date = "2026-06-01";

const getQuestsSentBy = async (userId: number) => {
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

const getQuestsSentTo = async (sentTo: number) => {
  const sentQuery: QueryCommandInput = {
    TableName: process.env.SENT_QUESTS_TABLE,
    IndexName: "sentToExpiresAtIndex",
    KeyConditionExpression: "sentTo = :sentTo AND expiresAt > :date",
    ExpressionAttributeValues: {
      ":sentTo": sentTo,
      ":date": date,
    },
  };
  return queryItemsInput<SentQuestTableItem>(sentQuery);
};

export default {
  getQuestsSentBy,
  getQuestsSentTo,
};
