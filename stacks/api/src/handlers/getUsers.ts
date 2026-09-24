import type { APIGatewayProxyEvent } from "aws-lambda";
import { getItems } from "../utils/DynamoDbUtils";
import { SeasonAccess, UserTableItem } from "@flotto/types";
import UserTable from "../utils/tables/UserTable";
import RequestUtils from "../utils/RequestUtils";
import ResponseUtils from "../utils/ResponseUtils";

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
    let user: UserTableItem | undefined = undefined;

    if (data.access) {
      if (data.access !== "supplier" && data.access !== "contractor") {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid access" }),
        };
      }

      user = await UserTable.updateAccess(id, data.access);
    }

    if (typeof data.available === "boolean") {
      const isAdmin = await RequestUtils.isAdmin(event);
      if (isAdmin) {
        user = await UserTable.updateAvailability(id, data.available);
      }
    }

    if (!user) {
      return ResponseUtils.noContent();
    }

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
