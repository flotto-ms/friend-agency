import { ContractTableItem, MsoQuest, MSOQuestLevel, MSOQuestType } from "@flotto/types";
import QuestUtility from "./QuestUtility";
import ContractTable from "./tables/ContractTable";
import { getAreaType, getFlottoQuestType } from "@flotto/utils";

const getQuestContract = async (quest: MsoQuest): Promise<ContractTableItem | undefined> => {
  const start = QuestUtility.getQuestStartedAt(quest);
  if (!start) {
    return undefined;
  }

  const userId = quest.sentTo ?? quest.userId;
  const questType = getFlottoQuestType(quest);

  let arena = quest.type === MSOQuestType.Arena ? getAreaType(quest) : undefined;

  const contracts = (await ContractTable.getUserQuestContracts(userId, questType, start))
    .filter((contract) => {
      if (!contract.filter) {
        return true;
      }

      if (contract.filter.level) {
        const filter = contract.filter.level;
        const level = quest.level * (quest.isElite ? 3 : 1);
        return filter.min <= level && level <= filter.max;
      }

      if (contract.filter.arenaLevel && arena) {
        const filter = contract.filter.arenaLevel;
        return filter.min <= arena.level && arena.level <= filter.max;
      }

      return false;
    })
    .sort((a, b) => b.price - a.price);

  if (contracts.length === 0) {
    return undefined;
  }

  return contracts[0];
};

export default {
  getQuestContract,
};
