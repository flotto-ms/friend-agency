import type { APIGatewayProxyEvent } from "aws-lambda";
import { getItems } from "../utils/DynamoDbUtils";
import { UserTableItem } from "@flotto/types";

export const handler = async (event: APIGatewayProxyEvent) => {
  const users = await getItems<UserTableItem>({
    TableName: process.env.USER_TABLE!,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ users }),
  };
};
