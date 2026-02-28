import { FlottoQuestId } from "../flotto";

export type ContractsTableItem = {
  userId: number;
  type: FlottoQuestId;
  price: number;
  startedAt: string;
  endedAt?: string;
};
