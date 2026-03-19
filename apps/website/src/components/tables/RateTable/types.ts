export type RateItem = {
  id: string;
  type: number;
  description: string;
  rate: number;
  enabled: boolean;
  stopping?: boolean;
  stopDate?: number;
  filter?: string;
  groups?: string[];
};
