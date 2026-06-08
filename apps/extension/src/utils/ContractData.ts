import type { GetContractsResponse } from "@flotto/types";
import { FlottoApi } from "../flotto/api";

export type QuestContract = Awaited<ReturnType<typeof FlottoApi.getContracts>>["contracts"][number];
export type QuestContracts = {
  id: number;
  contracts: QuestContract[];
  bestPrice: number;
};

export const getContracts = async () => {
  return chrome.storage.local
    .get(["contracts"])
    .then((r) => r.contracs as GetContractsResponse["contracts"] | undefined);
};

export const loadContracts = async () => {
  return FlottoApi.getContracts().then((result) => {
    chrome.storage.local.set({ contracts: result.contracts ?? [] });
    return result.contracts;
  });
};
