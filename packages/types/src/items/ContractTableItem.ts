import { FlottoQuestId } from "../flotto";

export type ContractTableItem = {
  userId: number;
  type: FlottoQuestId;
  price: number;
  startedAt: string;
  endedAt?: string;
};
