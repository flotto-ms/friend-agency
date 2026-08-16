import { QuestSearchItem } from "@/components/tables/QuestSearchTable/types";
import { ActiveContractItem } from "@/data/activeContractsSlice";

export const getMatchingContract = (quest: QuestSearchItem, contracts: ActiveContractItem[]) => {
  return contracts.filter((c) => c.type === quest.type);
};
export const getBestMatchingContract = (
  quest: QuestSearchItem,
  contracts: ActiveContractItem[],
): ActiveContractItem | undefined => {
  return getMatchingContract(quest, contracts).sort((a, b) => b.price - a.price)?.[0];
};
