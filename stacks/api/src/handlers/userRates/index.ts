import { APIGatewayProxyEvent } from "aws-lambda";
import RequestUtils from "../../utils/RequestUtils";
import ResponseUtils from "../../utils/ResponseUtils";
import UserTable from "../../utils/tables/UserTable";
import { listRates } from "./methods/list";
import { getRate } from "./methods/get";
import { createRate } from "./methods/create";
import { updateRate } from "./methods/update";
import { deleteRate } from "./methods/delete";

export const handler = async (event: APIGatewayProxyEvent) => {
  console.debug(event);
  try {
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

    if (event.pathParameters?.id !== "current" && parseInt(event.pathParameters!.id!) !== id) {
      return ResponseUtils.unauthorised("You can only manage your own rates");
    }

    const user = await UserTable.getUser(id);

    if (!user) {
      return ResponseUtils.notFound("Unknown User");
    }

    if (!event.pathParameters?.rate) {
      switch (event.httpMethod) {
        case "GET":
          return listRates(user);
        case "POST": {
          const body = JSON.parse(event.body ?? "{}");
          return createRate(user, body);
        }
        default:
          return unknownMethod();
      }
    }

    const rateId = event.pathParameters!.rate!;

    switch (event.httpMethod) {
      case "GET":
        return getRate(user, rateId);
      case "PUT": {
        const body = JSON.parse(event.body ?? "{}");
        return updateRate(user, rateId, body);
      }
      case "DELETE":
        return deleteRate(user, rateId);
      default:
        return unknownMethod();
    }
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
};

const unknownMethod = () => {
  return {
    statusCode: 405,
    body: JSON.stringify({ message: "Method not allowed" }),
  };
};
