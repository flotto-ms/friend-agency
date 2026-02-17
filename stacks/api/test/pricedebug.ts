import { ReceivedQuestTableItem, SentQuestTableItem } from "@flotto/types";
import QuestUtility from "../src/utils/QuestUtility";
import { createClient, updateItem } from "../src/utils/DynamoDbUtils";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

process.env.AWS_PROFILE = "flotto";
process.env.USER_TABLE = "ApiStack-UserTableBD4BF69E-1SUSR44YNTRHF";
process.env.RECEIVED_QUESTS_TABLE = "ApiStack-ReceivedQuestsTableA96F3BA7-J7KJK31JX5C1";
process.env.SENT_QUESTS_TABLE = "ApiStack-SentQuestsTable566DE4ED-P37HO94RNSKD";
process.env.CONTRACT_TABLE = "Contracts";

const quest: SentQuestTableItem = {
  userId: 11698196,
  id: 27477982,
  completedByInitiator: 1,
  country: "VN",
  daynum: 2431317,
  expiresAt: "2026-02-20T05:05:55.000Z",
  flotto: {
    status: "Inactive",
    type: 7,
  },
  initiatorId: 11698196,
  iqItems: {
    "381": 47,
    "536": 47,
  },
  isElite: 0,
  isSent: 1,
  items: {
    "381": 47,
    "536": 47,
  },
  level: 26,
  progress: 26,
  required: 26,
  reserveExpiresAt: "2026-02-20T05:05:55.000Z",
  sentTo: 20038267,
  type: 103,
  username: "SilentSlendy|Flotto",
};

const contracts = [
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 1, price: 215, startedAt: "2026-02-16T16:23:32.669Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 17, price: 215, startedAt: "2026-02-16T16:23:32.669Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 18, price: 215, startedAt: "2026-02-16T16:23:32.670Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 20, price: 210, startedAt: "2026-02-16T16:23:32.670Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 21, price: 230, startedAt: "2026-02-16T16:23:32.708Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 25, price: 175, startedAt: "2026-02-16T16:23:32.708Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 27, price: 175, startedAt: "2026-02-16T16:23:32.709Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 28, price: 210, startedAt: "2026-02-16T16:23:32.709Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 29, price: 210, startedAt: "2026-02-16T16:23:32.709Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 30, price: 210, startedAt: "2026-02-16T16:23:32.709Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 31, price: 170, startedAt: "2026-02-16T16:23:32.710Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 33, price: 200, startedAt: "2026-02-16T16:23:32.710Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 35, price: 230, startedAt: "2026-02-16T16:23:32.710Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 5, price: 230, startedAt: "2026-02-16T16:23:32.710Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 6, price: 230, startedAt: "2026-02-16T16:23:32.710Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 7, price: 250, startedAt: "2026-02-16T16:23:32.711Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 8, price: 225, startedAt: "2026-02-16T16:23:32.788Z", endedAt: "Active" },
  },
  {
    TableName: "Contracts",
    Item: { userId: 20038267, type: 9, price: 240, startedAt: "2026-02-16T16:23:32.788Z", endedAt: "Active" },
  },
];

Promise.all(
  contracts.map((command) => {
    (command.Item as any).userId_type = `${command.Item.userId}_${command.Item.type}`;
    return createClient().send(new PutCommand(command));
  }),
).then(() => console.log("done"));
