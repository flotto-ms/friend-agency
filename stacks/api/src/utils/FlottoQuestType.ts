import { FlottoQuestId, FlottoQuestType, RateFilter } from "@flotto/types";

const lookup = {
  "arena coins": FlottoQuestType.ArenaCoins,
  "custom L1-10": FlottoQuestType.Custom,
  "custom L💀": FlottoQuestType.CustomHD,
  "eff beg": FlottoQuestType.EffBeg,
  "eff int": FlottoQuestType.EffInt,
  "eff exp": FlottoQuestType.EffExp,
  gems: FlottoQuestType.Gems,
  xp: FlottoQuestType.Experience,
  mc: FlottoQuestType.MineCoin,
  "nf beg": FlottoQuestType.NfBeg,
  "nf int": FlottoQuestType.NfInt,
  "nf exp": FlottoQuestType.NfExp,
  "nf hard": FlottoQuestType.NfHard,
  "nf evil": FlottoQuestType.NfEvil,
  pvp: FlottoQuestType.PvP,
  "ws beg": FlottoQuestType.WinStreakBeg,
  "ws int": FlottoQuestType.WinStreakInt,
  "ws exp": FlottoQuestType.WinStreakExp,
  "wins beg": FlottoQuestType.WinsBeg,
  "wins int": FlottoQuestType.WinsInt,
  "wins exp": FlottoQuestType.WinsExp,
  "wins med": FlottoQuestType.WinsMed,
  "wins hard": FlottoQuestType.WinsHard,
  "wins evil": FlottoQuestType.WinsEvil,
  "speed arena": FlottoQuestType.ArenaSpeed,
  "speed ng arena": FlottoQuestType.ArenaSpeedNG,
  "nf arena": FlottoQuestType.ArenaNoFlags,
  "eff arena": FlottoQuestType.ArenaEfficiency,
  "hd arena": FlottoQuestType.ArenaHighDifficulty,
  "rd arena": FlottoQuestType.ArenaRandomDifficulty,
  "hc arena": FlottoQuestType.ArenaHardcore,
  "hcng arena": FlottoQuestType.ArenaHardcoreNG,
  ruby: FlottoQuestType.GemRuby,
  sapphire: FlottoQuestType.GemSapphire,
  topaz: FlottoQuestType.GemTopaz,
  onyx: FlottoQuestType.GemOnyx,
  aquamarine: FlottoQuestType.GemAquamarine,
  emerald: FlottoQuestType.GemEmerald,
  jade: FlottoQuestType.GemJade,
} as Record<string, FlottoQuestId>;

export const getRateQuestId = (name: string): FlottoQuestId | undefined => {
  const attempt = lookup[name];
  if (attempt) {
    return attempt;
  }

  const key = name.replace(/ (l*(\d+)-)*L*(\d+)\+{0,1}/i, "");
  console.log("getRateQuestId", name, key);
  return lookup[key];
};

export const getRateFilter = (name: string): RateFilter | undefined => {
  const attempt = lookup[name];
  if (attempt) {
    return undefined;
  }

  const result = / (l*(\d+)-)*L*(\d+)\+{0,1}$/i.exec(name);
  if (!result) {
    return undefined;
  }

  const max = parseInt(result[3]);
  const min = name.endsWith("+") ? 99 : result[2] ? parseInt(result[2]) : max;

  if (name.includes("arena")) {
    return { arenaLevel: { min, max } };
  }
  return { level: { min, max } };
};
