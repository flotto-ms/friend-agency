import { UserTableItem } from "@flotto/types";

export const listGroups = async (user: UserTableItem) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ groups: Object.entries(user.groups ?? {}).map(([id, group]) => ({ id, ...group })) }),
  };
};
