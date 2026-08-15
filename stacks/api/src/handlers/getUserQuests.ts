import type { APIGatewayProxyEvent } from "aws-lambda";
import { getItem, queryItems } from "../utils/DynamoDbUtils";
import { MsoQuest, UserTableItem } from "@flotto/types";
import { createCSV, getFlottoQuestType, getQuestDescription } from "@flotto/utils";
import { getUserQuestPrices } from "./getUserQuests/getPrices";
import { getUserReceivedQuests, getUserSentQuests, getUserSentQuestsDate } from "./getUserQuests/getQuests";
import RequestUtils from "../utils/RequestUtils";
import GetQuests from "../utils/mso/GetQuests";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;
  const type = event.pathParameters?.type;

  const userId = await RequestUtils.getUserId(event).catch((ex) => {
    console.error(ex);
    return 0;
  });

  if (userId === 0) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Invalid Token" }),
    };
  }

  if (!id || !userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  if (type === "unsent" && id !== "current" && parseInt(id) !== userId!) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "You can only access your own list" }),
    };
  }

  if (type === "prices") {
    const prices = await getUserQuestPrices(userId);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prices),
    };
  }

  if (type === "unsent") {
    const promise =
      userId === 11698196 ? getUserSentQuestsDate(userId, new Date("2026-06-05")) : GetQuests.getQuests(userId);

    const unsent = await promise.then((r) => {
      return r.map((quest) => ({
        ...quest,
        type: getFlottoQuestType(quest),
        description: getQuestDescription(quest),
      }));
    });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unsent),
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
    response = await getUserReceivedQuests(parseInt(id)).then((quests) => createCSV(quests, true));
  } else {
    response = await getUserSentQuests(parseInt(id)).then((quests) => createCSV(quests, false));
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
