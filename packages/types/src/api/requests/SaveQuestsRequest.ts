import { MsoQuest } from "../../mso";

export type SaveQuestsRequest = {
  received?: MsoQuest[];
  sent?: MsoQuest[];
};
