import type { APIGatewayProxyEvent } from "aws-lambda";
import DynamoDbUtils from "../utils/DynamoDbUtils";
import { AuthTableItem } from "@flotto/types";
import { generateCode } from "../utils/AuthCode";
import SendMessage from "../utils/mso/SendMessage";

type Body = {
  userId?: number;
  password?: string;
};

export const handler = async (event: APIGatewayProxyEvent) => {
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Search Tokens" }),
    };
  }

  const data: Body = JSON.parse(event.body ?? "{}");
  if (!data.userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing parameter: userId" }),
    };
  }

  const record = await DynamoDbUtils.getItem<AuthTableItem>({
    Key: { userId: data.userId },
    TableName: process.env.AUTH_TABLE!,
  }).then((r) => (r && r.ttl < Date.now() / 1000 ? undefined : r));

  if (data.password) {
    if (!record) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "OTP Expired" }),
      };
    }

    if (record.code !== data.password) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Invalid Password" }),
      };
    }

    await DynamoDbUtils.deleteItem({
      Key: { userId: data.userId },
      TableName: process.env.AUTH_TABLE!,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Password Correct" }),
    };
  } else if (!record) {
    const code = generateCode();
    await DynamoDbUtils.updateItem({
      Key: { userId: data.userId },
      TableName: process.env.AUTH_TABLE!,
      Attrs: {
        ttl: Math.floor(Date.now() / 1_000) + 300,
        code: code,
      },
    });

    SendMessage.sendMessage(data.userId, `Your Flotto one time password is: ${code}`, 919);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Password Sent" }),
  };
};
