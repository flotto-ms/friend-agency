import { RateItem } from "@/components/tables/RateTable/types";
import api from "../authSlice/api";
import { getQuestDescription } from "@/components/QuestTypeSelect";
import { getFilterDescription } from "@/lib/FilterDesc";

export type GetRateResponse = {
  rates: Record<string, Omit<RateItem, "id">>;
  groups: Record<string, { label: string }>;
};

export const fetchRates = async (userId?: number) => {
  return api.getUser(userId ? userId.toString() : undefined).then((r) => {
    const response: GetRateResponse = {
      rates: {},
      groups: r.groups ?? {},
    };

    if (r.rates) {
      Object.entries(r.rates as Record<string, any>).forEach(([id, rate]) => {
        response.rates[id] = {
          type: rate.type,
          description: getQuestDescription(rate.type.toString()),
          rate: rate.amount,
          enabled: rate.enabled,
          stopping: false,
          groups: rate.groups,
          filters: rate.filter,
          filter: rate.filter ? getFilterDescription(rate) : undefined,
        };
      });
    }

    return response;
  });
};

export const postSaveRate = async (rate: RateItem) => {
  return new Promise<RateItem>((resolve) => {
    setTimeout(() => resolve(rate), 750);
  });
};

export const postDeleteRate = async (id: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve(id), 750);
  });
};

export const postAddGroup = async (data: { label: string; rates?: string[] }) => {
  return api.user.groups.create(data.label, data.rates).then((group) => {
    return {
      id: group.id as string,
      label: data.label,
      rates: data.rates ?? [],
    };
  });
};

export const postDeleteGroup = async (id: string) => {
  return api.user.groups.delete(id);
};
