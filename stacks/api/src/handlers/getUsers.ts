import type { APIGatewayProxyEvent } from "aws-lambda";
import { SeasonAccess, UserTableItem } from "@flotto/types";
import UserTable from "../utils/tables/UserTable";
import RequestUtils from "../utils/RequestUtils";
import ResponseUtils from "../utils/ResponseUtils";
import DynamoDbUtils from "../utils/DynamoDbUtils";

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
      return ResponseUtils.unauthorised("Unknown User");
    }

    const auth = await RequestUtils.getAuth(event);
    if (event.pathParameters?.id !== "current" && id !== auth?.userId && !auth?.admin) {
      return ResponseUtils.unauthorised("You can only edit your own profile");
    }

    const data = JSON.parse(event.body ?? "{}");
    let user: UserTableItem | undefined = undefined;

    if (data.access) {
      const validAccess = ["member", "supplier", "contractor"];
      if (!validAccess.includes(data.access)) {
        return ResponseUtils.badRequest("Invalid access");
      }
      user = await UserTable.updateAccess(id, data.access);
    }

    if (typeof data.available === "boolean" && auth?.admin) {
      user = await UserTable.updateAvailability(id, data.available);
    }

    if (typeof data.ratesLocked === "boolean" && auth?.admin) {
      user = await DynamoDbUtils.updateItem<UserTableItem>({
        Key: { id },
        TableName: process.env.USER_TABLE!,
        Attrs: { ratesLocked: data.ratesLocked },
        Upsert: false,
      });
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
