import { formatNumber } from "./FormatNumber";
import { gems, wins, winStreak } from "@/components/QuestTypeSelect";

export type EliteFilter = "elite" | "notelite";
export type RateFilterRange = {
  min: number;
  max: number;
  step?: number;
};
export type RateFilter = {
  elite?: EliteFilter;
  level?: RateFilterRange;
  required?: RateFilterRange;
  efficiency?: RateFilterRange;
  density?: RateFilterRange;
  arenaLevel?: RateFilterRange;
};

type Rate = { type: number; filter?: RateFilter };
export const getFilterDescription = (rate: Rate) => {
  if (!rate.filter || Object.keys(rate.filter).length === 0) {
    return undefined;
  }

  if (rate.filter.required) {
    return `${formatNumber(rate.filter.required.min)} to ${formatNumber(rate.filter.required.max)} ${getTypeDesc(rate)}`;
  }

  if (rate.filter.level) {
    return `L${rate.filter.level.min} to L${rate.filter.level.max}`;
  }

  if (rate.filter.efficiency) {
    return `${rate.filter.efficiency.min}% to ${rate.filter.efficiency.max} Efficient`;
  }

  if (rate.filter.arenaLevel) {
    return `L${rate.filter.arenaLevel.min} to L${rate.filter.arenaLevel.max} Arena`;
  }

  if (rate.filter.density) {
    return `${rate.filter.density.min}% to ${rate.filter.density.max}% Density`;
  }

  return undefined;
};

const getTypeDesc = (rate: Rate) => {
  if (rate.type === 1 || rate.type === 9) {
    return "Coins";
  }
  if (rate.type === 8) {
    return "Exp";
  }
  if (wins.some((w) => w.value === rate.type.toString())) {
    return "Wins";
  }
  if (winStreak.some((w) => w.value === rate.type.toString())) {
    return "Wins";
  }
  if (rate.type === 7 || gems.some((w) => w.value === rate.type.toString())) {
    return "Gems";
  }
};
