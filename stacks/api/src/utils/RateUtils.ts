import { Rate, UserTableItem } from "@flotto/types";
import ContractActionTable from "./ContractActionTable";

export const logRateAction = async (user: UserTableItem, rate: Rate) => {
  const key = `quest_${rate.type}`;
  const old = user.rates?.[key];

  if (!old || old.amount !== rate.amount) {
    await ContractActionTable.logPrice(user.id, rate.type, rate.amount);
  }
  if (!old || old.enabled !== rate.enabled) {
    await ContractActionTable.logSubscription(user.id, rate.type, rate.enabled);
  }
};

export default {
  logRateAction,
};
