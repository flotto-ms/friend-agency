import { clients as clientsImport } from "../data/clients";
import { contracts } from "../data/contracts";
import type { parseQuests } from "../minesweeper/questParser";
import { getFlottoQuestType, formatNumber, getQuestDescription } from "@flotto/utils";

const contractors = new Set<number>();
const clients = new Set<number>(clientsImport);
contracts.forEach((c) => contractors.add(c.userId));

let printQuests = false;

export const c = (userId: number, quests: ReturnType<typeof parseQuests>) => {
  if (!quests) {
    return;
  }

  let totalSentMc = 0;
  let totalContractMC = 0;
  let totalSentEp = 0;
  let totalReceivedEp = 0;
  if (printQuests) {
    console.log(" ");
    console.log("----------- Sent ----------");
  }
  quests.sent
    .filter((item) => {
      return contractors.has(item.sentTo!);
    })
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.level - b.level;
      }
      return a.type - b.type;
    })
    .forEach((quest) => {
      const type = getFlottoQuestType(quest as any);
      const contract = contracts.find((c) => {
        return c.userId === quest.sentTo && type === c.type;
      });

      const price = contract?.price ?? 0;
      const questMC = price * quest.level * (quest.isElite ? 3 : 1);
      const creaeted = new Date(quest.expiresAt!);
      creaeted.setDate(creaeted.getDate() - 3);

      totalSentMc += questMC;
      totalSentEp += quest.items?.["536"] ?? 0;

      if (printQuests) {
        console.log(
          creaeted.toISOString(),
          "\t",
          `L${quest.level}${quest.isElite ? "E" : ""}`,
          "\t",
          "+" + quest.items?.["536"],
          "\t",
          `${price}/l`,
          "\t",
          `${questMC}mc`,
          "\t",
          getQuestDescription(quest as any),
        );
      }
    });

  if (printQuests) {
    console.log(" ");
    console.log("--------- received --------");
  }

  quests.received
    .filter((item) => clients.has(item.initiatorId!))
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.level - b.level;
      }
      return a.type - b.type;
    })
    .forEach((quest) => {
      const type = getFlottoQuestType(quest as any);
      const contract = contracts.find((c) => {
        return c.userId === userId && type === c.type;
      });

      const price = contract?.price ?? 0;
      const questMC = price * quest.level * (quest.isElite ? 3 : 1);

      totalContractMC += questMC;
      totalReceivedEp += quest.items?.["536"] ?? 0;

      if (printQuests) {
        console.log(
          quest.createdAt!,
          "\t",
          `L${quest.level}${quest.isElite ? "E" : ""}`,
          "\t",
          "+" + quest.items?.["536"],
          "\t",
          `${price}/l`,
          "\t",
          `${questMC}mc`,
          "\t",
          getQuestDescription(quest as any),
        );
      }
    });

  if (printQuests) {
    console.log(" ");
  }

  console.log("-------------- Totals -------------");
  console.log("Total Sold", "\t\t\t", formatNumber(totalSentMc), "mc", "\t", formatNumber(totalSentEp));
  console.log("Total Purchased", "\t", formatNumber(totalContractMC), "mc", "\t", formatNumber(totalReceivedEp));
  console.log("-----------------------------------");
  console.log("Balance", "\t\t\t", formatNumber(totalSentMc - totalContractMC), "mc");
  console.log(" ");
};
