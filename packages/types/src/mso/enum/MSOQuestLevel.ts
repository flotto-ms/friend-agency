export const MSOQuestLevel = {
  Beginner: 1,
  Intermediate: 2,
  Expert: 3,
  Custom: 4,
  Easy: 11,
  Medium: 12,
  Hard: 13,
  Evil: 14,
  CustomHD: 15,
  PvP: 50,
  PvP2: 51,
} as const;

export type MsoQuestLevel = (typeof MSOQuestLevel)[keyof typeof MSOQuestLevel];
