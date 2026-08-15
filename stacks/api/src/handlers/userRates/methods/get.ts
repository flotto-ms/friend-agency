import { UserTableItem } from "@flotto/types";
import ResponseUtils from "../../../utils/ResponseUtils";

export const getRate = async (user: UserTableItem, rateId: string) => {
  const rate = user.rates?.[rateId];

  if (!rate) {
    return ResponseUtils.notFound("Rate does not exist.");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ id: rateId, ...rate }),
  };
};
