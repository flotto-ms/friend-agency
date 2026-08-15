import { APIGatewayProxyEvent } from "aws-lambda";
import JwtUtils from "./JwtUtils";

const getUserId = async (event: APIGatewayProxyEvent): Promise<number | undefined> => {
  const id = event.pathParameters?.id;
  if (!id) {
    return undefined;
  }
  if (id !== "current") {
    return parseInt(id);
  }

  const header = event.headers["Authorization"];
  if (!header) {
    throw new Error("No Authorization Token");
  }

  const token = header.replace("Bearer ", "");
  const claims = await JwtUtils.verify(token);
  if (!claims) {
    throw new Error("Invalid Token");
  }

  if (typeof claims.sub === "number") {
    return claims.sub;
  }

  throw new Error("Invalid Token");
};

export default {
  getUserId,
};
