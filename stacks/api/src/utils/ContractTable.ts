import { ContractTableItem, FlottoQuestId } from "@flotto/types";
import { putItem, queryItems, updateItem } from "./DynamoDbUtils";

export const getActiveContracts = () => {
  return queryItems<ContractTableItem>({
    TableName: process.env.CONTRACT_TABLE!,
    IndexName: "EndedAtUserIdIndex",
    KeyCondition: {
      endedAt: "Active",
    },
  });
};

export const getActiveUserContracts = async (userId: number, rateId?: string) => {
  const items = await queryItems<ContractTableItem>({
    TableName: process.env.CONTRACT_TABLE!,
    IndexName: "EndedAtUserIdIndex",
    KeyCondition: {
      endedAt: "Active",
      userId,
    },
  });

  if (rateId) {
    return items.filter((item) => item.rateId === rateId);
  }

  return items;
};

export const startContract = async (item: Omit<ContractTableItem, "key" | "endedAt">) => {
  await putItem({
    TableName: process.env.CONTRACT_TABLE!,
    Item: { ...item, endedAt: "Active", key: getKey(item.userId, item.rateId) },
  });
};

export const endContract = async (item: ContractTableItem) => {
  if (item.endedAt !== "Active") {
    return;
  }

  await updateItem({
    TableName: process.env.CONTRACT_TABLE!,
    Key: {
      key: item.key,
      startedAt: item.startedAt,
    },
    Attrs: {
      endedAt: new Date().toISOString(),
    },
  });
};

export const getUserQuestContracts = async (userId: number, type: FlottoQuestId, date: Date) => {
  const items = await queryItems<ContractTableItem>({
    TableName: process.env.CONTRACT_TABLE!,
    IndexName: "UserIdTypeIndex",
    KeyCondition: {
      userId,
      type,
    },
  });

  return items.filter((contract) => {
    const start = new Date(contract.startedAt);
    if (start > date) {
      return false;
    }

    if (contract.endedAt === "Active") {
      return true;
    }

    const end = new Date(contract.endedAt);
    return date <= end;
  });
};

export const getContractHistory = async (key: string) => {
  return queryItems<ContractTableItem>({
    TableName: process.env.CONTRACT_TABLE!,
    KeyCondition: {
      key,
    },
  });
};

const getKey = (userId: number, rateId: string) => {
  return `${userId}_${rateId}`;
};
export default {
  getActiveContracts,
  getActiveUserContracts,
  getContractHistory,
  getUserQuestContracts,
  getKey,
  startContract,
  endContract,
};
