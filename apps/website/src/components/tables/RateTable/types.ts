import { RateFilter } from "@/lib/FilterDesc";

export type RateItem = {
  id: string;
  type: number;
  description: string;
  rate: number;
  enabled: boolean;
  stopping?: boolean;
  stopDate?: number;
  filter?: string;
  preferExchange?: boolean;
  filters?: RateFilter;
  groups?: string[];
};
