import { APIGatewayProxyEvent } from "aws-lambda";
import RequestUtils from "../utils/RequestUtils";
import { FlottoQuestId, MsoQuest } from "@flotto/types";
import { FlottoQuestStatus } from "../../../../packages/types/src/flotto/FlottoQuestDetails";

type UserTransactionItem = {
  id: number;
  sent: boolean;
  type: FlottoQuestId;
  isElite: boolean;
  level: number;
  description: string;
  price: number;
  status: FlottoQuestStatus;
  date: string;
  username: string;
  country: string;
  contractor?: MsoQuest;
  client?: MsoQuest;
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;
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

  return {
    stausCode: 200,
  };
};
