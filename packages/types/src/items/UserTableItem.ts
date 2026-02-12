import type { FlottoQuestId } from "../flotto";

export type UserTableItem = {
  id: number;
  username: string;
  contractor: boolean;
  slots?: number;
  paused?: boolean;
  rates?: Record<FlottoQuestId, Rate>;
};

export type Rate = {
  price: number;
  enabled: boolean;
};
