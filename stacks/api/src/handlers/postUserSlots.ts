import type { APIGatewayProxyEvent } from "aws-lambda";
import { updateItem } from "../utils/DynamoDbUtils";
import { SaveSlotsRequest } from "@flotto/types";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  const data = JSON.parse(event.body ?? "{}") as SaveSlotsRequest;

  await updateItem({
    Key: { id: parseInt(id) },
    TableName: process.env.USER_TABLE!,
    Attrs: {
      slots: data.slots,
    },
    Upsert: true,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Success" }),
  };
};
