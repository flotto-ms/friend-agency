export const MSOGemType = {
  Topaz: 1,
  Rubie: 2,
  Sapphire: 3,
  Amethyst: 4,
  Onyx: 5,
  Aquamarine: 6,
  Emerald: 7,
  Garnet: 8,
  Jade: 9,
  Diamond: 10,
} as const;

export type MsoGemType = (typeof MSOGemType)[keyof typeof MSOGemType];
