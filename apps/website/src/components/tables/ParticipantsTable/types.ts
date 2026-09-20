export type ParticipantItem = {
  id: number;
  username: string;
  country: string;
  available?: boolean;
  slots?: number;
};
