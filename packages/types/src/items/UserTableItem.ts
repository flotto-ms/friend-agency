import type { FlottoQuestId } from "../flotto";

export type UserTableItem = {
  id: number;
  username: string;
  contractor: boolean;
  slots?: number;
  available?: boolean;
  admin?: boolean;
  rates?: Record<string, Rate>;
  season?: Record<string, SeasonAccess>;
};

export type SeasonAccess = "contractor" | "client";
export type Rate = {
  type: FlottoQuestId;
  amount: number;
  enabled: boolean;
  filter?: RateFilter;
};

export type RateFilterRange = {
  min: number;
  max: number;
};

export type RateFilter = {
  required?: RateFilterRange;
  efficiency?: RateFilterRange;
  density?: RateFilterRange;
  arenaLevel?: RateFilterRange;
};
