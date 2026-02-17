import { FlottoQuestDetails } from "../flotto/FlottoQuestDetails";
import { MsoQuest } from "../mso";

export type SentQuestTableItem = MsoQuest & {
  flotto?: FlottoQuestDetails;
};
