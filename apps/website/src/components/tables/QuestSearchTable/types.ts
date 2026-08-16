export type QuestSearchItem = {
  id: number;
  type: number;
  level: number;
  elite: boolean;
  required: number;
  description: string;
  rate?: number;
  username?: string;
  country?: string;
  sentTo: number;
  options?: Record<string, unknown>;
};
