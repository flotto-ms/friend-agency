import { FlottoQuestId } from "../flotto";
import { RateFilter } from "./UserTableItem";

export type ContractTableItem = {
  key: string;
  userId: number;
  rateId: string;
  type: FlottoQuestId;
  price: number;
  startedAt: string;
  endedAt: string;
  filter?: RateFilter;
};
