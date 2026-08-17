import { APIGatewayProxyEvent } from "aws-lambda";
import RequestUtils from "../utils/RequestUtils";
import { FlottoQuestId, MsoQuest, ReceivedQuestTableItem, SentQuestTableItem } from "@flotto/types";
import { FlottoQuestStatus } from "../../../../packages/types/src/flotto/FlottoQuestDetails";
import ReceivedQuestsTable from "../utils/tables/ReceivedQuestsTable";
import SentQuestsTable from "../utils/tables/SentQuestsTable";

type UserTransactionItem = {
  id: number;
  sent: boolean;
  type: FlottoQuestId;
  isElite: boolean;
  level: number;
  description: string;
  price: number;
  status: FlottoQuestStatus;
  date: string;
  username: string;
  country: string;
  contractor?: MsoQuest;
  client?: MsoQuest;
};

const buildTransactionItem = (
  quest: SentQuestTableItem | ReceivedQuestTableItem,
  sent: boolean,
): UserTransactionItem => {
  const questType = (quest.type ?? "quest") as FlottoQuestId;
  const description = quest.flotto?.type ? `${quest.flotto.type}` : `${questType}`;

  return {
    id: quest.id,
    sent,
    type: questType,
    isElite: Boolean(quest.isElite),
    level: quest.level,
    description,
    price: quest.flotto?.price ?? 0,
    status: quest.flotto?.status ?? "Ignored",
    date: quest.createdAt ?? quest.expiresAt ?? quest.reserveExpiresAt ?? new Date().toISOString(),
    username: quest.username ?? "Unknown",
    country: quest.country ?? "xx",
    contractor: sent ? (quest as MsoQuest) : undefined,
    client: sent ? undefined : (quest as MsoQuest),
  };
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;
  const userId = await RequestUtils.getUserId(event).catch((ex) => {
    console.error(ex);
    return 0;
  });

  if (userId === 0) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Invalid Token" }),
    };
  }

  if (!id || !userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  const [questsSentToUser, questsReceivedByUser] = await Promise.all([
    SentQuestsTable.getQuestsSentTo(userId),
    ReceivedQuestsTable.getQuestsReceivedBy(userId),
  ]);

  const transactions = [
    ...questsSentToUser.map((quest) => buildTransactionItem(quest, true)),
    ...questsReceivedByUser.map((quest) => buildTransactionItem(quest, false)),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    statusCode: 200,
    body: JSON.stringify({ items: transactions }),
  };
};
