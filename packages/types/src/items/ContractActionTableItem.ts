import { ContractorRate } from "../api";
import { FlottoQuestId } from "../flotto";

export type ContractAction = "Price" | "Subscription" | "Pause" | "Rate";

export type ContractActionTableItem = {
  key: string;
  action: ContractAction;
  userId: number;
  type: FlottoQuestId;
  timestamp: string;
  price?: number;
  subscribed?: boolean;
  paused?: boolean;
  rate?: ContractorRate;
};
