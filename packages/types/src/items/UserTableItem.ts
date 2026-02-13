import type { FlottoQuestId } from "../flotto";

export type UserTableItem = {
  id: number;
  username: string;
  contractor: boolean;
  slots?: number;
  available?: boolean;
  rates?: Record<string, Rate>;
};

export type Rate = {
  type: FlottoQuestId;
  amount: number;
  enabled: boolean;
};
