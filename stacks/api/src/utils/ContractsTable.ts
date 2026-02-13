import { ContractTableItem, FlottoQuestId } from "@flotto/types";
import { putItem, queryItems, updateItem } from "./DynamoDbUtils";

const removeEndedAt = (items: ContractTableItem[]) => {
  return items.map((item) => {
    const { endedAt, ...rest } = item;
    return rest as ContractTableItem;
  });
};

export const getActiveContracts = async (type: FlottoQuestId) => {
  return queryItems<ContractTableItem>({
    TableName: process.env.CONTRACT_TABLE!,
    IndexName: "UserIdEndedAtIndex",
    KeyCondition: {
      type,
      endedAt: "Active",
    },
  }).then(removeEndedAt);
};

export const getActiveUserContracts = async (userId: number, type?: FlottoQuestId) => {
  const items = await queryItems<ContractTableItem>({
    TableName: process.env.CONTRACT_TABLE!,
    IndexName: "UserIdEndedAtIndex",
    KeyCondition: {
      userId,
      endedAt: "Active",
    },
  }).then(removeEndedAt);

  if (type) {
    const item = items.find((item) => item.type === type);
    return item ? [item] : [];
  }

  return items;
};

export const startContract = async (item: ContractTableItem) => {
  await putItem({
    TableName: process.env.CONTRACT_TABLE!,
    Item: { ...item, endedAt: "Active" },
  });
};

export const endContract = async (item: ContractTableItem) => {
  if (item.endedAt) {
    return;
  }

  await updateItem({
    TableName: process.env.CONTRACT_TABLE!,
    Key: {
      type: item.type,
      startedAt: item.startedAt,
    },
    Attrs: {
      endedAt: new Date().toISOString(),
    },
  });
};

export default {
  getActiveContracts,
  getActiveUserContracts,
  startContract,
  endContract,
};
