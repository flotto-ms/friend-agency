import { UserTableItem } from "@flotto/types";
import ResponseUtils from "../../../utils/ResponseUtils";

export const getGroup = async (user: UserTableItem, groupId: string) => {
  const group = user.groups?.[groupId];

  if (!group) {
    return ResponseUtils.notFound("Group does not exist.");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ id: groupId, label: group.label }),
  };
};
