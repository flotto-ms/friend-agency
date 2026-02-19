import type { APIGatewayProxyEvent } from "aws-lambda";
import { ReceivedQuestTableItem, SaveQuestsResponse, SentQuestTableItem, type SaveQuestsRequest } from "@flotto/types";
import { updateItem } from "../utils/DynamoDbUtils";
import QuestUtility from "../utils/QuestUtility";

export const handler = async (event: APIGatewayProxyEvent) => {
  const userParam = event.pathParameters?.id;

  if (!userParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  const data: SaveQuestsRequest = JSON.parse(event.body ?? "{}");
  const response: SaveQuestsResponse = {
    received: [],
    sent: [],
  };

  if (data.received) {
    for (let quest of data.received) {
      const { id, userId, ...attrs } = quest;
      await updateItem<ReceivedQuestTableItem>({
        TableName: process.env.RECEIVED_QUESTS_TABLE!,
        Key: { userId: parseInt(userParam), id },
        Attrs: attrs,
        Upsert: true,
      })
        .then((item) => {
          if (item.flotto) {
            response.received.push({
              id: item.id,
              flotto: item.flotto,
            });
            return;
          }
          return QuestUtility.getFlottoDetails(item).then((details) => {
            response.received.push({
              id: item.id,
              flotto: details,
            });

            return updateItem<ReceivedQuestTableItem>({
              TableName: process.env.RECEIVED_QUESTS_TABLE!,
              Key: { userId: parseInt(userParam), id },
              Attrs: { flotto: details },
            });
          });
        })
        .catch((ex) => {
          console.error(ex);
        });
    }
  }

  if (data.sent) {
    for (let quest of data.sent) {
      const { id, userId, ...attrs } = quest;
      await updateItem<SentQuestTableItem>({
        TableName: process.env.SENT_QUESTS_TABLE!,
        Key: { userId: parseInt(userParam), id },
        Attrs: attrs,
        Upsert: true,
      })
        .then((item) => {
          if (item.flotto) {
            response.sent.push({
              id: item.id,
              flotto: item.flotto,
            });
            return;
          }

          return QuestUtility.getFlottoDetails(item).then((details) => {
            response.sent.push({
              id: item.id,
              flotto: details,
            });

            return updateItem<SentQuestTableItem>({
              TableName: process.env.SENT_QUESTS_TABLE!,
              Key: { userId: parseInt(userParam), id },
              Attrs: { flotto: details },
            });
          });
        })
        .catch((ex) => {
          console.error(ex);
        });
    }
  }

  console.debug("Complete");

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response),
  };
};
