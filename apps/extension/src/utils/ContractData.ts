import type { GetContractsResponse } from "@flotto/types";
import { FlottoApi } from "../flotto/api";

let lastLoad = 0;

export type QuestContract = Awaited<ReturnType<typeof FlottoApi.getContracts>>["contracts"][number];
export type QuestContracts = {
  id: number;
  contracts: QuestContract[];
  bestPrice: number;
};

export const getContracts = async () => {
  return chrome.storage.local
    .get(["contracts"])
    .then((r) => r.contracts as GetContractsResponse["contracts"] | undefined);
};

export const loadContracts = async () => {
  if (Date.now() - lastLoad < 60_000) {
    return getContracts();
  }

  return FlottoApi.getContracts().then((result) => {
    chrome.storage.local.set({ contracts: result.contracts ?? [] });
    lastLoad = Date.now();
    return result.contracts;
  });
};
