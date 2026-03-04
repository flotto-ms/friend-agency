import { RateItem } from "@/components/tables/RateTable/types";

export type GetRateResponse = {
  rates: Record<string, Omit<RateItem, "id">>;
  groups: Record<string, { label: string }>;
};

const data: GetRateResponse = {
  rates: {
    xp: {
      type: 8,
      description: "Experience",
      rate: 220,
      enabled: true,
      stopping: false,
      groups: ["group-1"],
    },
    mc: {
      type: 9,
      description: "Mine Coins",
      rate: 220,
      enabled: true,
      stopping: false,
      groups: ["group-1"],
    },
    "rate-1": {
      type: 21,
      description: "Expert Wins",
      rate: 250,
      enabled: true,
      stopping: false,
      groups: ["group-2"],
    },
    "rate-2": {
      type: 18,
      description: "Expert Win Streak",
      rate: 240,
      enabled: true,
      stopping: false,
      filter: "max 4 wins",
      groups: ["group-2"],
    },
    "rate-3": {
      type: 20,
      description: "Intermediate Wins",
      rate: 240,
      enabled: false,
      stopping: false,
      filter: "min 15 wins",
      groups: ["group-3"],
    },
    "rate-4": {
      type: 17,
      description: "Intermediate Win Streak",
      rate: 240,
      enabled: false,
      stopping: false,
      filter: "max 10 wins",
      groups: ["group-3"],
    },
  },
  groups: {
    "group-1": {
      label: "Passives",
    },
    "group-2": {
      label: "Expert",
    },
    "group-3": {
      label: "Intermediate",
    },
  },
};

export const fetchRates = async (userId: number) => {
  return new Promise<GetRateResponse>((resolve) => {
    setTimeout(() => resolve(data), 1_250);
  });
};

export const postSaveRate = async (rate: RateItem) => {
  return new Promise<RateItem>((resolve) => {
    setTimeout(() => resolve(rate), 750);
  });
};

export const postAddGroup = async (data: {
  label: string;
  rates?: string[];
}) => {
  return new Promise<{ id: string; label: string; rates?: string[] }>(
    (resolve) => {
      setTimeout(() => resolve({ id: crypto.randomUUID(), ...data }), 750);
    },
  );
};

export const postDeleteGroup = async (id: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve(id), 750);
  });
};
