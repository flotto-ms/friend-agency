import { NullOptional, Rate, UserTableItem } from "@flotto/types";
import ResponseUtils from "../../../utils/ResponseUtils";

export const updateGroup = async (
  user: UserTableItem,
  rateId: string,
  changes: Partial<NullOptional<Omit<Rate, "type">>>,
) => {
  const rate = user.rates?.[rateId];
  if (!rate) {
    return ResponseUtils.notFound("Rate not found");
  }

  if (changes.amount) {
    //update amount
  }

  if (typeof changes.enabled === "boolean") {
    //update enabled
  }

  if (changes.filter == null || (changes.filter && Object.keys(changes.filter).length === 0)) {
    //delete filter
  } else if (changes.filter) {
    //replace filter
  }

  if (changes.groups === null || (changes.groups && changes.groups.length === 0)) {
    //delete groups
  } else {
    //replace group set
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ id: rateId, ...rate }),
  };
};
