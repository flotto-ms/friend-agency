import { FlottoQuestType, MSOArenaType, MSOGemType, MSOQuestLevel, MSOQuestType } from "@flotto/types";
import type {
  MsoQuest,
  MsoQuestArena,
  MsoQuestEfficiency,
  MsoQuestGem,
  MsoQuestNG,
  MsoQuestNoFlag,
  MsoQuestWinStreak,
} from "@flotto/types";
import { getAreaType } from "./QuestDescription";

export const getFlottoQuestType = (quest: MsoQuest) => {
  switch (quest.type) {
    case MSOQuestType.WinsBeg:
      return FlottoQuestType.WinsBeg;
    case MSOQuestType.WinsInt:
      return FlottoQuestType.WinsInt;
    case MSOQuestType.WinsExp:
      return FlottoQuestType.WinsExp;
    case MSOQuestType.ArenaCoins:
      return FlottoQuestType.ArenaCoins;
    case MSOQuestType.Gems:
      return FlottoQuestType.Gems;
    case MSOQuestType.MineCoins:
      return FlottoQuestType.MineCoin;
    case MSOQuestType.Custom:
      return quest.isElite && quest.level === 22 ? FlottoQuestType.CustomHD : FlottoQuestType.Custom;
    case MSOQuestType.Experience:
      return FlottoQuestType.Experience;
    case MSOQuestType.PVP:
      return FlottoQuestType.PvP;
    case MSOQuestType.WinStreak:
      return getWinStreakType(quest);
    case MSOQuestType.Efficiency:
      return getEfficiencyType(quest);
    case MSOQuestType.NoFlag:
      return getNoFlagType(quest);
    case MSOQuestType.GemSpecific:
      return getGemType(quest);
    case MSOQuestType.NoGuess:
      return getNoGuessType(quest);
    case MSOQuestType.Arena:
      return getArenaQuestType(quest);
  }
};

const getWinStreakType = (quest: MsoQuestWinStreak) => {
  switch (quest.options.level) {
    case MSOQuestLevel.Beginner:
      return FlottoQuestType.WinStreakBeg;
    case MSOQuestLevel.Intermediate:
      return FlottoQuestType.WinStreakInt;
    case MSOQuestLevel.Expert:
      return FlottoQuestType.WinStreakExp;
    default:
      return;
  }
};

const getEfficiencyType = (quest: MsoQuestEfficiency) => {
  switch (quest.options.level) {
    case MSOQuestLevel.Beginner:
      return FlottoQuestType.EffBeg;
    case MSOQuestLevel.Intermediate:
      return FlottoQuestType.EffInt;
    case MSOQuestLevel.Expert:
      return FlottoQuestType.EffExp;
    default:
      return;
  }
};
const getNoFlagType = (quest: MsoQuestNoFlag) => {
  switch (quest.options.level) {
    case MSOQuestLevel.Beginner:
      return FlottoQuestType.NfBeg;
    case MSOQuestLevel.Intermediate:
      return FlottoQuestType.NfInt;
    case MSOQuestLevel.Expert:
      return FlottoQuestType.NfExp;
    case MSOQuestLevel.Evil:
      return FlottoQuestType.NfEvil;
    case MSOQuestLevel.Hard:
      return FlottoQuestType.NfHard;
    default:
      return;
  }
};

const getGemType = (quest: MsoQuestGem) => {
  switch (quest.options.gem) {
    case MSOGemType.Rubie:
      return FlottoQuestType.GemRuby;
    case MSOGemType.Sapphire:
      return FlottoQuestType.GemSapphire;
    case MSOGemType.Emerald:
      return FlottoQuestType.GemEmerald;
    case MSOGemType.Aquamarine:
      return FlottoQuestType.GemAquamarine;
    case MSOGemType.Topaz:
      return FlottoQuestType.GemTopaz;
    case MSOGemType.Onyx:
      return FlottoQuestType.GemOnyx;
    case MSOGemType.Jade:
      return FlottoQuestType.GemJade;
    default:
      return;
  }
};

const getNoGuessType = (quest: MsoQuestNG) => {
  switch (quest.options.level) {
    case MSOQuestLevel.Hard:
      return FlottoQuestType.WinsHard;
    case MSOQuestLevel.Medium:
      return FlottoQuestType.WinsMed;
    case MSOQuestLevel.Evil:
      return FlottoQuestType.WinsEvil;
    default:
      return;
  }
};

const getArenaQuestType = (quest: MsoQuestArena) => {
  switch (getAreaType(quest).type) {
    case MSOArenaType.Speed:
      return FlottoQuestType.ArenaSpeed;
    case MSOArenaType.SpeedNG:
      return FlottoQuestType.ArenaSpeedNG;
    case MSOArenaType.Efficiency:
      return FlottoQuestType.ArenaEfficiency;
    case MSOArenaType.HighDifficulty:
      return FlottoQuestType.ArenaHighDifficulty;
    case MSOArenaType.NoFlags:
      return FlottoQuestType.ArenaNoFlags;
    case MSOArenaType.RandomDifficulty:
      return FlottoQuestType.ArenaRandomDifficulty;
    case MSOArenaType.Hardcore:
      return FlottoQuestType.ArenaHardcore;
    case MSOArenaType.HardcoreNG:
      return FlottoQuestType.ArenaHardcoreNG;
    default:
      return;
  }
};
