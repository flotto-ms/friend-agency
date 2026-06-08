import { ContractTableItem } from "../../items";

export type GetContractsResponse = {
  contracts: Omit<ContractTableItem, "key" | "rateId" | "startedAt" | "endedAt">[];
};
