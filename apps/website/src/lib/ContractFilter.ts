import { QuestSearchItem } from "@/components/tables/QuestSearchTable/types";
import { ActiveContractItem } from "@/data/activeContractsSlice";

type Filter = {
  min: number;
  max: number;
};

export const ARENA_OFFSET = 100;

export const getAreaType = (quest: QuestSearchItem) => {
  const type = quest.options!.type as number;
  return {
    type: Math.floor((type - ARENA_OFFSET) / 10),
    level: (type - ARENA_OFFSET) % 10,
  };
};

export const getMatchingContract = (quest: QuestSearchItem, contracts: ActiveContractItem[]) => {
  return contracts.filter((contract) => {
    if (contract.type !== quest.type) {
      return false;
    }

    if (!contract.filter) {
      return true;
    }

    if (contract.filter.level) {
      const filter = contract.filter.level as Filter;
      const level = quest.level * (quest.elite ? 3 : 1);
      if (!(filter.min <= level && level <= filter.max)) {
        return false;
      }
    }

    if (contract.filter.required) {
      const filter = contract.filter.required as Filter;
      const required = quest.required;
      if (!(filter.min <= required && required <= filter.max)) {
        return false;
      }
    }

    if (contract.filter.arenaLevel && quest.options) {
      const arena = getAreaType(quest);
      const filter = contract.filter.arenaLevel as Filter;
      if (!(filter.min <= arena.level && arena.level <= filter.max)) {
        return false;
      }
    }

    if (contract.filter.efficiency && quest.options) {
      const filter = contract.filter.efficiency as Filter;
      const eff = quest.options.eff as number;
      if (!(filter.min <= eff && eff <= filter.max)) {
        return false;
      }
    }

    if (contract.filter.density && quest.options) {
      const width = quest.options.sizeX as number;
      const height = quest.options.sizeY as number;
      const mines = quest.options.mines as number;

      const percent = (mines / (width * height)) * 100;
      const filter = contract.filter.density as Filter;
      if (!(filter.min <= percent && percent <= filter.max)) {
        return false;
      }
    }

    return true;
  });
};
export const getBestMatchingContract = (
  quest: QuestSearchItem,
  contracts: ActiveContractItem[],
): ActiveContractItem | undefined => {
  return getMatchingContract(quest, contracts).sort((a, b) => b.price - a.price)?.[0];
};
