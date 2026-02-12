import { MsoArenaType } from "../enum/MSOArenaType";
import { MsoGemType } from "../enum/MSOGemType";
import { MsoQuestLevel } from "../enum/MSOQuestLevel";
import { MsoQuestType } from "../enum/MSOQuestType";

type MsoQuestBase = {
  id: number;
  type: MsoQuestType;
  required: number;
  progress: number;
  level: number;
  duration?: number;
  isElite: boolean;
  sentTo?: number;
  initiatorId?: number;
  completedByInitiator?: boolean;
  userId: number;
  username: string;
  createdAt?: string;
  expiresAt?: string;
  reserveExpiresAt?: string;
  country: string;
  completed?: 1 | 0;
  expired?: null | 1;
  items?: Record<string, number>;
};

export type MsoQuestNG = MsoQuestBase & { options: MsoQuestLevelOptions };
export type MsoQuestWinStreak = MsoQuestBase & { options: MsoQuestLevelOptions };
export type MsoQuestEfficiency = MsoQuestBase & { options: MsoQuestLevelOptions };
export type MsoQuestNoFlag = MsoQuestBase & { options: MsoQuestLevelOptions };
export type MsoQuestGem = MsoQuestBase & { options: MsoQuestGemOptions };
export type MsoQuestArena = MsoQuestBase & { options: MsoQuestArenaOptions };

export type MsoQuest = MsoQuestArena &
  MsoQuestNG &
  MsoQuestGem &
  MsoQuestNoFlag &
  MsoQuestEfficiency &
  MsoQuestWinStreak &
  MsoQuestBase & { options?: object };

export type MsoQuestCustomOptions = {
  sizeX: number;
  sizeY: number;
  mines: number;
};

export type MsoQuestGemOptions = {
  gem: MsoGemType;
};

export type MsoQuestArenaOptions = {
  type: MsoArenaType;
};

export type MsoQuestLevelOptions = {
  level: MsoQuestLevel;
};

export type MsoQuestOptions = MsoQuestCustomOptions | MsoQuestGemOptions | MsoQuestArenaOptions | MsoQuestLevelOptions;
