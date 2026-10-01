import { QuestSearchItem } from "@/components/tables/QuestSearchTable/types";
import { ActiveContractItem } from "@/data/activeContractsSlice";
import { ContractorUser } from "@/data/contractorsSlice";
import rateConfig from "../../public/rateconfig.json";

const bestColor = "bg-red-500";
const closeColor = "bg-purple-500";

const colors = [
  "bg-[#0ea5e9]",
  "bg-[#3ca9e9]",
  "bg-[#51ade9]",
  "bg-[#61b1e9]",
  "bg-[#6fb5e9]",
  "bg-[#7ab8ea]",
  "bg-[#85bcea]",
  "bg-[#8ebfea]",
  "bg-[#97c3ea]",
  "bg-[#9fc6ea]",
  "bg-[#a7c9ea]",
  "bg-[#afccea]",
  "bg-[#b6d0ea]",
  "bg-[#bcd3ea]",
  "bg-[#c3d6ea]",
  "bg-[#c9d9eb]",
  "bg-[#cfdceb]",
  "bg-[#d5dfeb]",
  "bg-[#dae1eb]",
  "bg-[#e0e4eb]",
  "bg-[#e5e7eb]",
];

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

export const getMatchingContracts = (quest: QuestSearchItem, contracts: ActiveContractItem[]) => {
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
  contractors: ContractorUser[],
  hideExchangeOnly: boolean,
): { contract: ActiveContractItem; color: string } | undefined => {
  const matched = getMatchingContracts(quest, contracts).sort((a, b) => b.price - a.price);
  if (matched.length === 0) {
    return undefined;
  }

  const available = matched
    .filter(
      (c) =>
        (!hideExchangeOnly && c.preferExchange) || (!c.preferExchange && contractors.some((u) => c.userId === u.id)),
    )
    .sort((a, b) => b.price - a.price);

  if (available.length === 0) {
    return undefined;
  }

  const maxPrice = matched[0].price;
  const minPrice = rateConfig[quest.type.toString()]?.minAmount ?? 0;
  const bestPrice = available[0].price;
  const color = getQuestColor(bestPrice, maxPrice, minPrice);
  const contract = available.filter((q) => q.price === bestPrice).sort(() => Math.random() - 0.5)[0];

  const data = {
    contract,
    color,
  };

  return data;
};

const getQuestColor = (price: number, max: number, min: number) => {
  if (price === max) {
    return bestColor;
  }

  if (price / max > 0.95) {
    return closeColor;
  }

  const ceil = max * 0.95 - min;
  const val = price - min;
  const percent = val / ceil;
  const colIndex = Math.round(colors.length * percent);

  return colors[colIndex];
};
