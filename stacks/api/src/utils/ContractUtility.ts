import {
  ContractTableItem,
  MsoQuest,
  MsoQuestCustomOptions,
  MsoQuestEfficiencyOptions,
  RateFilterRange,
} from "@flotto/types";
import QuestUtility from "./QuestUtility";
import ContractTable from "./tables/ContractTable";
import { getAreaType, getFlottoQuestType } from "@flotto/utils";

export const contractMatchesQuest = (contract: ContractTableItem, quest: MsoQuest) => {
  if (contract.type !== quest.type) {
    return false;
  }

  if (!contract.filter) {
    return true;
  }

  if (contract.filter.level) {
    const filter = contract.filter.level as RateFilterRange;
    const level = quest.level * (quest.isElite ? 3 : 1);
    if (!(filter.min <= level && level <= filter.max)) {
      return false;
    }
  }

  if (contract.filter.required) {
    const filter = contract.filter.required as RateFilterRange;
    const required = quest.required;
    if (!(filter.min <= required && required <= filter.max)) {
      return false;
    }
  }

  if (contract.filter.arenaLevel && quest.options) {
    const arena = getAreaType(quest);
    const filter = contract.filter.arenaLevel as RateFilterRange;
    if (!(filter.min <= arena.level && arena.level <= filter.max)) {
      return false;
    }
  }

  if (contract.filter.efficiency && quest.options) {
    const options: MsoQuestEfficiencyOptions = quest.options as any;
    const filter = contract.filter.efficiency as RateFilterRange;
    const eff = options.eff;
    if (!(filter.min <= eff && eff <= filter.max)) {
      return false;
    }
  }

  if (contract.filter.density && quest.options) {
    const options: MsoQuestCustomOptions = quest.options as any;
    const width = options.sizeX;
    const height = options.sizeY;
    const mines = options.mines;

    const percent = (mines / (width * height)) * 100;
    const filter = contract.filter.density as RateFilterRange;
    if (!(filter.min <= percent && percent <= filter.max)) {
      return false;
    }
  }

  return true;
};

const getQuestContract = async (quest: MsoQuest): Promise<ContractTableItem | undefined> => {
  const start = QuestUtility.getQuestStartedAt(quest);
  if (!start) {
    return undefined;
  }

  const userId = quest.sentTo ?? quest.userId;
  const questType = getFlottoQuestType(quest);

  const contracts = (await ContractTable.getUserQuestContracts(userId, questType, start))
    .filter((contract) => contractMatchesQuest(contract, quest))
    .sort((a, b) => b.price - a.price);

  if (contracts.length === 0) {
    return undefined;
  }

  return contracts[0];
};

export default {
  getQuestContract,
};
