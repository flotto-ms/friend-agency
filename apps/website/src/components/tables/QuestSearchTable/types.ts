export type QuestSearchItem = {
  id: number;
  type: number;
  level: number;
  elite: boolean;
  description: string;
  rate?: number;
  username?: string;
  country?: string;
  sentTo: number;
};
