import { ContractActionTableItem, ContractsTableItem, UserTableItem } from "@flotto/types";
import { MinContractRates } from "../../src/data/MinContractRates";

const INITIAL_AVAILABILITY = true;
const INITIAL_RATE_ENABLED = true;

export const processActions = (actions: ContractActionTableItem[]) => {
  const users: Record<number, UserTableItem> = {};
  const contracts: ContractsTableItem[] = [];

  actions.forEach((action: ContractActionTableItem) => {
    let user = users[action.userId];
    if (!user) {
      user = {
        id: action.userId,
        username: "Unknown",
        rates: {},
        available: INITIAL_AVAILABILITY,
        contractor: true,
      };
      users[action.userId] = user;
    }

    if (action.action === "Pause") {
      user.available = !action.paused;
      if (action.paused) {
        contracts
          .filter((c) => c.userId === action.userId && c.endedAt === "Active")
          .forEach((c) => (c.endedAt = action.timestamp));
      } else {
        Object.values(user.rates!)
          .filter((r) => r.enabled)
          .forEach((rate) => {
            contracts.push({
              userId: user.id,
              type: rate.type,
              price: rate.amount,
              startedAt: action.timestamp,
              endedAt: "Active",
            });
          });
      }
    } else {
      const key = `quest_${action.type}`;
      let rate = user.rates![key];
      const minPrice = MinContractRates[`${action.type}`]!;

      if (!rate) {
        rate = {
          type: action.type,
          amount: (action.price ?? 0) > minPrice ? action.price! : minPrice,
          enabled: action.subscribed ?? INITIAL_RATE_ENABLED,
        };
        user.rates![key] = rate;
      } else if (action.action === "Price") {
        rate.amount = (action.price ?? 0) > minPrice ? action.price! : minPrice;
      } else if (action.action === "Subscription") {
        rate.enabled = action.subscribed!;
      }

      //Expire Active
      const contract = contracts.find(
        (c) => c.userId === action.userId && c.type === action.type && c.endedAt === "Active",
      );

      if (contract?.price == rate.amount && rate.enabled) {
        console.log("No Change");
        //No Change
      } else {
        if (contract) {
          contract.endedAt = action.timestamp;
        }

        //Create Contract if enabled
        if (rate.enabled) {
          contracts.push({
            userId: user.id,
            type: rate.type,
            price: rate.amount,
            startedAt: action.timestamp,
            endedAt: "Active",
          });
        }
      }
    }
  });

  return {
    users,
    contracts,
  };
};
