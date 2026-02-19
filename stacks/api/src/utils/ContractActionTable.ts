import { ContractAction, ContractActionTableItem, ContractTableItem, FlottoQuestId } from "@flotto/types";
import DynamoDbUtils from "./DynamoDbUtils";

const logPause = async (userId: number, paused: boolean, timestamp?: string) => {
  const action: ContractAction = "Pause";
  putItem({
    key: createKey(userId, 0, action),
    type: 0,
    userId,
    action,
    paused,
    timestamp: createTimestamp(timestamp),
  });
};

const logSubscription = async (userId: number, quest: FlottoQuestId, subscribed: boolean, timestamp?: string) => {
  const action: ContractAction = "Subscription";
  putItem({
    key: createKey(userId, quest, action),
    type: quest,
    userId,
    action,
    subscribed,
    timestamp: createTimestamp(timestamp),
  });
};

const logPrice = async (userId: number, quest: FlottoQuestId, price: number, timestamp?: string) => {
  const action: ContractAction = "Price";
  return putItem({
    key: createKey(userId, quest, action),
    type: quest,
    userId,
    action,
    price,
    timestamp: createTimestamp(timestamp),
  });
};

const createKey = (userId: number, quest: FlottoQuestId, action: ContractAction) => `${userId}_${quest}_${action}`;
const createTimestamp = (timestamp?: string) => (timestamp ? timestamp : new Date().toISOString());

const putItem = async (item: ContractActionTableItem) => {
  return DynamoDbUtils.putItem<ContractActionTableItem>({
    TableName: process.env.CONTRACT_ACTION_TABLE!,
    Item: item,
  }).catch((ex) => console.error(ex));
};

export default {
  logPause,
  logSubscription,
  logPrice,
};
