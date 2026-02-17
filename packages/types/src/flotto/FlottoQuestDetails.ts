import { FlottoQuestId } from "../main";

export type FlottoQuestStatus = "Active" | "Inactive" | "Disputed" | "Cancelled" | "Auctioned" | "Ignored";

export type FlottoQuestDetails = {
  type: FlottoQuestId;
  status: FlottoQuestStatus;
  price?: number;
};
