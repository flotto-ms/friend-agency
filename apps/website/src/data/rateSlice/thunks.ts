import { RateItem } from "@/components/tables/RateTable/types";
import api from "../../lib/api";
import { getQuestDescription } from "@/components/QuestTypeSelect";
import { getFilterDescription } from "@/lib/FilterDesc";

export type GetRateResponse = {
  rates: Record<string, Omit<RateItem, "id">>;
  groups: Record<string, { label: string }>;
};

export const fetchRates = async (userId?: number) => {
  const user = await api.user.get(userId ? userId.toString() : "current");
  const response: GetRateResponse = {
    rates: {},
    groups: user.groups ?? {},
  };

  const userRates = user.rates ?? {};
  Object.entries(userRates as Record<string, any>).forEach(([id, rate]) => {
    if (!rate) {
      return;
    }

    response.rates[id] = {
      type: rate.type,
      description: getQuestDescription(rate.type.toString()),
      rate: rate.amount,
      enabled: rate.enabled,
      stopping: false,
      groups: rate.groups ?? [],
      filters: rate.filter,
      filter: rate.filter ? getFilterDescription(rate) : undefined,
    };
  });

  return response;
};

export const postSaveRate = async (rate: RateItem) => {
  const { id, description, stopping, stopDate, filter, ...rest } = rate;
  const payload = {
    type: rest.type,
    amount: rest.rate,
    enabled: rest.enabled,
    groups: rest.groups && rest.groups.length > 0 ? rest.groups : undefined,
    filter: rest.filters && Object.keys(rest.filters).length > 0 ? rest.filters : undefined,
  };

  const isUpdate = Boolean(id && !id.startsWith("tmp_"));
  const result = isUpdate ? await api.user.rates.update(id, payload) : await api.user.rates.create(payload);

  return {
    ...rate,
    id: result.id ?? id,
    type: result.type ?? rest.type,
    rate: result.amount ?? rest.rate,
    enabled: result.enabled ?? rest.enabled,
    filter: result.filter ? getFilterDescription(result) : undefined,
    filters: result.filter ?? rest.filters,
    groups: result.groups ?? rest.groups ?? [],
    description: result.description ?? description,
  } as RateItem;
};

export const postDeleteRate = async (id: string) => {
  await api.user.rates.delete(id);
  return id;
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
