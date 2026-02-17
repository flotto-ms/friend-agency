import { UserTableItem } from "@flotto/types";
import { getItem } from "./DynamoDbUtils";

const getUser = (id: number) => {
  return getItem<UserTableItem>({
    TableName: process.env.USER_TABLE!,
    Key: { id: id },
  });
};

export default {
  getUser,
};
