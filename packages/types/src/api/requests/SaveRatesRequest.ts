import { MsoQuest } from "../../mso";

export type SaveRatesRequest = {
  rates: ContractorRate[];
};

export type ContractorRate = {
  name: string;
  amount: number;
  enabled: boolean;
};
