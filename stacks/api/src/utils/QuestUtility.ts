import { ReceivedQuestTableItem, SentQuestTableItem } from "@flotto/types";
import UserTable from "./UserTable";
import { getFlottoQuestType } from "@flotto/utils";
import { FlottoQuestDetails } from "../../../../packages/types/src/flotto/FlottoQuestDetails";
import ContractUtility from "./ContractUtility";

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

  const contract = await ContractUtility.getQuestContract(quest);
  console.log(contract);
  if (contract) {
    const levels = quest.level * (quest.isElite ? 3 : 1);
    details.price = levels * contract.price;
    details.status = "Active";
  } else {
    details.status = "Inactive";
  }
  return details;
};

export default {
  getQuestStartedAt,
  getFlottoDetails,
};
