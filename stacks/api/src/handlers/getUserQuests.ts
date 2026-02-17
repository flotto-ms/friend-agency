import type { APIGatewayProxyEvent } from "aws-lambda";
import { getItem, queryItems } from "../utils/DynamoDbUtils";
import { MsoQuest, UserTableItem } from "@flotto/types";
import { createCSV } from "@flotto/utils";
import { getUserQuestPrices } from "./getUserQuests/getPrices";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;
  const type = event.pathParameters?.type;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  if (type === "prices") {
    const prices = await getUserQuestPrices(parseInt(id));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prices),
    };
  }

  if (type !== "received" && type !== "sent") {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameter: type" }),
    };
  }

  const user = await getItem<UserTableItem>({
    Key: { id: parseInt(id) },
    TableName: process.env.USER_TABLE!,
  });

  if (!user) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Unable to find users with id " + id }),
    };
  }

  let response: string;
  if (type === "received") {
    const quests = await queryItems<MsoQuest>({
      KeyCondition: { userId: parseInt(id) },
      TableName: process.env.RECEIVED_QUESTS_TABLE!,
    });
    response = createCSV(quests, true);
  } else {
    const quests = await queryItems<MsoQuest>({
      KeyCondition: { userId: parseInt(id) },
      TableName: process.env.SENT_QUESTS_TABLE!,
    });
    response = createCSV(quests, false);
  }

  const filename = `${user.username} - ${new Date().toLocaleDateString("en-GB")} - FQ ${type}.csv`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
    body: response,
  };
};
