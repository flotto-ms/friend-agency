export type RateItem = {
  id: string;
  type: number;
  description: string;
  rate: number;
  enabled: boolean;
  stopping: boolean;
  filter?: string;
  groups?: string[];
};
