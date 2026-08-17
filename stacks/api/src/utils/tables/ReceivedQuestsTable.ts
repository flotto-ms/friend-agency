import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { queryItemsInput } from "../DynamoDbUtils";
import { ReceivedQuestTableItem } from "@flotto/types";

const date = "2026-06-01";

const getQuestsReceivedBy = async (userId: number) => {
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

const getQuestsInitiatedBy = async (initiatorId: number) => {
  const receivedQuery: QueryCommandInput = {
    TableName: process.env.RECEIVED_QUESTS_TABLE,
    IndexName: "InitiatorIdCreatedAtIndex",
    KeyConditionExpression: "initiatorId = :userId AND createdAt > :date",
    ExpressionAttributeValues: {
      ":initiatorId": initiatorId,
      ":date": date,
    },
  };
  return queryItemsInput<ReceivedQuestTableItem>(receivedQuery);
};

export default {
  getQuestsInitiatedBy,
  getQuestsReceivedBy,
};
