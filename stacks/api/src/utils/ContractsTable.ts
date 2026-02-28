import { ContractsTableItem, FlottoQuestId } from "@flotto/types";
import { createClient, putItem, queryItems, updateItem } from "./DynamoDbUtils";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const removeEndedAt = (items: ContractsTableItem[]) => {
  return items.map((item) => {
    const { endedAt, ...rest } = item;
    return rest as ContractsTableItem;
  });
};

export const getActiveUserContracts = async (userId: number, type?: FlottoQuestId) => {
  const items = await queryItems<ContractsTableItem>({
    TableName: process.env.CONTRACTS_TABLE!,
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

export const startContract = async (item: Omit<ContractsTableItem, "userId_type">) => {
  await putItem({
    TableName: process.env.CONTRACTS_TABLE!,
    Item: { ...item, endedAt: "Active", userId_type: getUserTypeKey(item.userId, item.type) },
  });
};

export const endContract = async (item: ContractsTableItem) => {
  if (item.endedAt) {
    return;
  }

  await updateItem({
    TableName: process.env.CONTRACTS_TABLE!,
    Key: {
      type: item.type,
      startedAt: item.startedAt,
    },
    Attrs: {
      endedAt: new Date().toISOString(),
    },
  });
};

export const getContract = async (type: FlottoQuestId, userId: number, dateStart: Date) => {
  const command = new QueryCommand({
    TableName: process.env.CONTRACTS_TABLE!,
    IndexName: "UserIdTypeEndedAtIndex",
    KeyConditions: {
      userId_type: {
        AttributeValueList: [getUserTypeKey(userId, type)],
        ComparisonOperator: "EQ",
      },
      endedAt: {
        AttributeValueList: [dateStart.toISOString()],
        ComparisonOperator: "GT",
      },
    },
    Limit: 1,
  });
  console.log(command.input);

  const result = await createClient().send(command);
  if (!result.Items) {
    return undefined;
  }
  return (result.Items as ContractsTableItem[]).find((item) => new Date(item.startedAt) < dateStart);
};

const getUserTypeKey = (userId: number, type: number) => {
  return `${userId}_${type}`;
};
export default {
  getActiveUserContracts,
  startContract,
  endContract,
  getContract,
};
