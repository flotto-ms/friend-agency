export type QuestSearchItem = {
  id: number;
  type: number;
  level: number;
  elite: boolean;
  required: number;
  description: string;
  rate?: number;
  userId?: number;
  username?: string;
  country?: string;
  sentTo: number;
  preferExchange?: boolean;
  options?: Record<string, unknown>;
  color?: string;
};
