import type { APIGatewayProxyEvent } from "aws-lambda";
import type { SaveQuestsRequest } from "@flotto/types";
import { updateItem } from "../utils/DynamoDbUtils";

export const handler = async (event: APIGatewayProxyEvent) => {
  const userParam = event.pathParameters?.id;

  if (!userParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  const data: SaveQuestsRequest = JSON.parse(event.body ?? "{}");

  if (data.received) {
    for (let quest of data.received) {
      const { id, userId, ...attrs } = quest;
      await updateItem({
        TableName: process.env.RECEIVED_QUESTS_TABLE!,
        Key: { userId: parseInt(userParam), id },
        Attrs: attrs,
        Upsert: true,
      }).catch((ex) => {
        console.error(ex);
      });
    }
  }

  if (data.sent) {
    for (let quest of data.sent) {
      const { id, userId, ...attrs } = quest;
      await updateItem({
        TableName: process.env.SENT_QUESTS_TABLE!,
        Key: { userId: parseInt(userParam), id },
        Attrs: attrs,
        Upsert: true,
      }).catch((ex) => {
        console.error(ex);
      });
    }
  }

  console.debug("Complete");

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Success" }),
  };
};
