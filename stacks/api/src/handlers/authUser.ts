import type { APIGatewayProxyEvent } from "aws-lambda";
import DynamoDbUtils from "../utils/DynamoDbUtils";
import { AuthTableItem } from "@flotto/types";
import { generateCode } from "../utils/AuthCode";
import SendMessage from "../utils/mso/SendMessage";
import { generateSearchToken, validateSearchToken } from "./authUser/searchToken";
import JwtUtils from "../utils/JwtUtils";
import UserTable from "../utils/UserTable";

type Body = {
  userId?: number;
  password?: string;
};

export const handler = async (event: APIGatewayProxyEvent) => {
  if (event.httpMethod === "GET") {
    const token = await generateSearchToken();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Under Construction" }),
      headers: {
        "X-FlottoToken": token,
      },
    };
  }

  const validToken = await validateSearchToken(event.headers["Authorization"]);

  if (!validToken) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Invalid Token" }),
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
      console.log(record, data);
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Invalid Password" }),
      };
    }

    const token = (
      await Promise.all([
        JwtUtils.create(data.userId, false),
        DynamoDbUtils.deleteItem({
          Key: { userId: data.userId },
          TableName: process.env.AUTH_TABLE!,
        }),
      ])
    )[0];

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } else if (!record) {
    const code = generateCode();
    await DynamoDbUtils.updateItem({
      Key: { userId: data.userId },
      TableName: process.env.AUTH_TABLE!,
      Attrs: {
        ip: event.requestContext.identity.sourceIp,
        ttl: Math.floor(Date.now() / 1_000) + 300,
        code: code,
      },
      Upsert: true,
    });

    await SendMessage.sendMessage(data.userId, `Your Flotto one time password is: ${code}`, 980).then((u) => {
      return UserTable.updateDetails(u.id, u.username, u.country);
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Password Sent" }),
  };
};
