import { FlottoQuestId } from "../main";

export type FlottoQuestStatus =
  | "Contracted"
  | "NoContract"
  | "Exchanged"
  | "Disputed"
  | "Cancelled"
  | "Auctioned"
  | "Ignored";

export type FlottoQuestDetails = {
  type: FlottoQuestId;
  status: FlottoQuestStatus;
  price?: number;
  contract?: string;
};
