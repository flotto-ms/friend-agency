import { FlottoQuestDetails } from "../../flotto/FlottoQuestDetails";

export type SaveQuestsResponse = {
  received: { id: number; flotto: FlottoQuestDetails }[];
  sent: { id: number; flotto: FlottoQuestDetails }[];
};
