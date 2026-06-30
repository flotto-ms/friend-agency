import { formatNumber } from "./FormatNumber";

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

export const getFilterDescription = (rate: { filter?: RateFilter }) => {
  if (!rate.filter || Object.keys(rate.filter).length === 0) {
    return undefined;
  }

  if (rate.filter.required) {
    return `${formatNumber(rate.filter.required.min)} to ${formatNumber(rate.filter.required.max)}`;
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
