import { APIGatewayProxyEvent } from "aws-lambda";
import RequestUtils from "../../utils/RequestUtils";
import { listGroups } from "./methods/list";
import { createGroup } from "./methods/create";
import { getGroup } from "./methods/get";
import { updateGroup } from "./methods/update";
import { deleteGroup } from "./methods/delete";
import ResponseUtils from "../../utils/ResponseUtils";
import UserTable from "../../utils/tables/UserTable";

export const handler = async (event: APIGatewayProxyEvent) => {
  console.debug(event);
  const id = await RequestUtils.getUserId(event).catch((ex) => {
    console.error(ex);
    return 0;
  });

  if (id === 0) {
    return ResponseUtils.unauthorised("Invalid Token");
  }

  if (!id) {
    return ResponseUtils.unauthorised("Unknown User");
  }

  if (event.pathParameters!.id !== "current" && parseInt(event.pathParameters!.id!) !== id) {
    return ResponseUtils.unauthorised("You can only manage your own groups");
  }

  const user = await UserTable.getUser(id);

  if (!user) {
    return ResponseUtils.notFound("Unknown User");
  }

  if (!event.pathParameters?.group) {
    switch (event.httpMethod) {
      case "GET":
        return listGroups(user);
      case "PUT":
        const { label, rates } = JSON.parse(event.body!);
        return createGroup(user, label, rates);
    }
  }

  const group = event.pathParameters!.group!;
  switch (event.httpMethod) {
    case "GET":
      return getGroup(user, group);
    case "POST":
      const { label } = JSON.parse(event.body!);
      return updateGroup(user, group, label);
    case "DELETE":
      return deleteGroup(user, group);
  }
};
