import type { APIGatewayProxyEvent } from "aws-lambda";
import { getItems } from "../utils/DynamoDbUtils";
import { SeasonAccess, UserTableItem } from "@flotto/types";
import UserTable from "../utils/tables/UserTable";
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

  if (event.httpMethod === "PATCH") {
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "A current user is required" }),
      };
    }

    const data = JSON.parse(event.body ?? "{}");
    if (data.access !== "supplier" && data.access !== "contractor") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid access" }),
      };
    }

    const user = await UserTable.updateAccess(id, data.access);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    };
  }

  if (!id) {
    const filter = event.queryStringParameters?.access as SeasonAccess | undefined;
    const users = await UserTable.getUsers(filter).then((r) => {
      return r.map(({ id, username, slots, country, available, access }) => ({
        id,
        username,
        access: access ?? "member",
        slots,
        country,
        available,
      }));
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
