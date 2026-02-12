export const MSOArenaType = {
  Speed: 1,
  SpeedNG: 2,
  NoFlags: 3,
  Efficiency: 4,
  HighDifficulty: 5,
  RandomDifficulty: 6,
  Hardcore: 7,
  HardcoreNG: 8,
  Endurance: 9,
  Nightmare: 10,
} as const;

export type MsoArenaType = (typeof MSOArenaType)[keyof typeof MSOArenaType];
