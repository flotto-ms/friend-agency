import { FlottoQuestDetails } from "../flotto/FlottoQuestDetails";
import { MsoQuest } from "../mso";

export type ReceivedQuestTableItem = MsoQuest & {
  flotto?: FlottoQuestDetails;
};
