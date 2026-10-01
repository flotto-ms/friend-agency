import type { APIGatewayProxyEvent } from "aws-lambda";
import { SaveSlotsRequest } from "@flotto/types";
import UserTable from "../utils/tables/UserTable";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  const data = JSON.parse(event.body ?? "{}") as SaveSlotsRequest;
  const user = await UserTable.getUser(parseInt(id));
  if (user) {
    await UserTable.updateAvailability(parseInt(id), (user.allowFriendQuests ?? true) && data.slots < 10, data.slots);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Success" }),
  };
};
