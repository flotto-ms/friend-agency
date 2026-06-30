import type { APIGatewayProxyEvent } from "aws-lambda";
import { getItems } from "../utils/DynamoDbUtils";
import { UserTableItem } from "@flotto/types";
import UserTable from "../utils/UserTable";
import RequestUtils from "../utils/RequestUtils";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = await RequestUtils.getUserId(event).catch((ex) => {
    console.error(ex);
    return 0;
  });

  if (id === 0) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Invalid Token" }),
    };
  }

  if (!id) {
    const users = await getItems<UserTableItem>({
      TableName: process.env.USER_TABLE!,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users }),
    };
  }

  const user = await UserTable.getUser(id);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  };
};
