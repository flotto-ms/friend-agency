import type { FlottoQuestId } from "../flotto";

export type UserTableItem = {
  id: number;
  username: string;
  country: string;
  contractor: boolean;
  slots?: number;
  available?: boolean;
  admin?: boolean;
  rates?: Record<string, Rate>;
  groups?: Record<string, Group>;
  season?: Record<string, SeasonAccess>;
};

export type SeasonAccess = "contractor" | "client";

export type Rate = {
  type: FlottoQuestId;
  amount: number;
  enabled: boolean;
  filter?: RateFilter;
  groups?: string[];
};

export type Group = {
  label: string;
};

export type EliteFilter = "elite" | "notelite";
export type RateFilterRange = {
  min: number;
  max: number;
};
export type RateFilter = {
  elite?: EliteFilter;
  level?: RateFilterRange;
  required?: RateFilterRange;
  efficiency?: RateFilterRange;
  density?: RateFilterRange;
  arenaLevel?: RateFilterRange;
};
