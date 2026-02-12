export const MSOQuestType = {
  Experience: 10,
  MineCoins: 11,
  Custom: 12,
  Mastery: 13,
  WinStreak: 14,
  Efficiency: 15,
  NoFlag: 17,
  ArenaCoins: 18,
  NoGuess: 19,
  Arena: 26,
  WinsBeg: 31,
  WinsInt: 32,
  WinsExp: 33,
  PVP: 40,
  Gems: 103,
  GemSpecific: 104,
} as const;

export type MsoQuestType = (typeof MSOQuestType)[keyof typeof MSOQuestType];
