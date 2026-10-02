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
    return ResponseUtils.unauthorised("Invalid Token");
  }

  if (event.httpMethod === "PATCH") {
    if (!id) {
      return ResponseUtils.badRequest("A current user is required");
    }
    const data = JSON.parse(event.body ?? "{}");
    let user: UserTableItem | undefined = undefined;

    if (data.access) {
      if (data.access !== "supplier" && data.access !== "contractor") {
        return ResponseUtils.badRequest("Invalid access");
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

    return ResponseUtils.json(user);
  }

  if (!id) {
    const filter = event.queryStringParameters?.access as SeasonAccess | undefined;
    const users = await UserTable.getUsers(filter).then((r) => {
      return r.map(({ id, username, slots, country, available, access, hasExtension }) => ({
        id,
        username: username ?? `Anonymous${id}`,
        access: access ?? "member",
        slots,
        country,
        available,
        hasExtension,
      }));
    });

    return ResponseUtils.json({ users });
  }

  const user = await UserTable.getUser(id);

  if (!user) {
    return ResponseUtils.notFound("Unknown User");
  }

  return ResponseUtils.json(user);
};
