import { ContractActionTableItem } from "@flotto/types";
import { ContractorPauseActions } from "../data/ContractorPauseActions";
import ContractActionTable from "../../src/utils/ContractActionTable";
import { ContractorPriceActions } from "../data/ContractorPriceActions";
import { getRateQuestId } from "../../src/utils/FlottoQuestType";
import { ContractorSubscriptionActions } from "../data/ContractorSubscriptionActions";
import { createClient } from "../../src/utils/DynamoDbUtils";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const parseTimestamp = (value: string) => {
  return new Date(value.replace("February,", "February 2026,")).toISOString();
};

const filterlive = (max: Date) => {
  return (item: ContractActionTableItem) => {
    const date = new Date(item.timestamp);
    return date < max;
  };
};
export const getLiveActions = async () => {
  const actions: ContractActionTableItem[] = [];
  let lastKey: Record<string, any> | undefined;

  do {
    await createClient()
      .send(
        new ScanCommand({
          TableName: process.env.CONTRACT_ACTION_TABLE,
          ExclusiveStartKey: lastKey,
        }),
      )
      .then((r) => {
        if (r.Items) {
          actions.push(...(r.Items as ContractActionTableItem[]));
        }
        lastKey = r.LastEvaluatedKey;
      });
  } while (lastKey);

  return actions;
};

export const getActions = async (mergeLive: boolean) => {
  const liveActions = mergeLive ? await getLiveActions() : [];
  let liveActionStart = new Date("2027-01-01");

  liveActions.forEach((action) => {
    const date = new Date(action.timestamp);
    if (date < liveActionStart) {
      liveActionStart = date;
    }
  });

  console.log("live action start:", liveActionStart.toISOString());

  const actions: ContractActionTableItem[] = [
    ...ContractorPauseActions.map((action) => {
      const item: ContractActionTableItem = {
        key: ContractActionTable.createKey(action.userId, 0, "Pause"),
        userId: action.userId,
        action: "Pause",
        type: 0,
        paused: action.paused,
        timestamp: new Date(action.timestamp).toISOString(),
      };
      return item;
    }).filter(filterlive(liveActionStart)),

    ...ContractorPriceActions.map((action) => {
      const type = getRateQuestId(action.quest_type) ?? 0;
      const value = action.action === "Deleted" ? 0 : parseInt(action.value);

      const item: ContractActionTableItem = {
        key: ContractActionTable.createKey(action.cntr_ID, type, "Price"),
        userId: action.cntr_ID,
        action: "Price",
        type,
        price: value,
        timestamp: parseTimestamp(action.timestamp),
      };
      return item;
    }).filter(filterlive(liveActionStart)),

    ...ContractorSubscriptionActions.map((action) => {
      const type = getRateQuestId(action.type) ?? 0;
      const item: ContractActionTableItem = {
        key: ContractActionTable.createKey(action.userId, type, "Subscription"),
        userId: action.userId,
        action: "Subscription",
        type,
        subscribed: action.subscribed,
        timestamp: new Date(action.timestamp).toISOString(),
      };
      return item;
    }).filter(filterlive(liveActionStart)),

    ...liveActions,
  ];

  return actions.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};
