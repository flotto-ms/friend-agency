import { ReceivedQuestTableItem, SentQuestTableItem } from "@flotto/types";
import { getContract } from "./ContractsTable";
import UserTable from "./UserTable";
import { getFlottoQuestType } from "@flotto/utils";
import { FlottoQuestDetails } from "../../../../packages/types/src/flotto/FlottoQuestDetails";

const getContractPrice = async (quest: ReceivedQuestTableItem | SentQuestTableItem) => {
  const start = getQuestStartedAt(quest);
  if (!start) {
    return undefined;
  }

  const contract = await getContract(getFlottoQuestType(quest)!, quest.sentTo ?? quest.userId, start);
  if (!contract) {
    return undefined;
  }

  const levels = quest.level * (quest.isElite ? 3 : 1);
  return levels * contract.price;
};

const getQuestStartedAt = (quest: ReceivedQuestTableItem | SentQuestTableItem) => {
  if (quest.createdAt) {
    return new Date(quest.createdAt);
  }

  if (quest.reserveExpiresAt) {
    const created = new Date(quest.reserveExpiresAt);
    created.setDate(created.getDate() - 3);
    return created;
  }
  return undefined;
};

const getFlottoDetails = async (quest: ReceivedQuestTableItem | SentQuestTableItem) => {
  const userId = quest.initiatorId ?? quest.sentTo;
  const user = userId ? await UserTable.getUser(userId) : undefined;

  const details: FlottoQuestDetails = {
    type: getFlottoQuestType(quest),
    status: "Ignored",
  };
  if (!user) {
    return details;
  }

  const price = await getContractPrice(quest);
  if (price) {
    details.price = price;
    details.status = "Active";
  } else {
    details.status = "Inactive";
  }
  return details;
};

export default {
  getContractPrice,
  getFlottoDetails,
};
