import { applyDescription } from "../constants/QuestDescriptions";
import { formatNumber } from "./FormatNumber";
import { MSOQuestType } from "@flotto/types";
import type { MsoArenaType, MsoQuest, MsoQuestArena } from "@flotto/types";

export const PLURAL_QUESTS = [15, 35, 36, 16, 24, 31, 32, 33, 34, 19, 17, 40, 18, 25, 102, 103, 23, 9];
export const WIN_QUESTS = [16, 24, 31, 32, 33, 34];
export const EFF_QUESTS = [15, 35, 36];
export const NG_LEVELS = [11, 12, 13, 14, 15, 111, 112, 113, 114, 115];
export const ARENA_OFFSET = 100;

export const getQuestDescription = (e: MsoQuest) => {
  let n = (e.options ? e.options : {}) as any,
    r: Record<string, string | number> = {};

  r["%amount%"] = formatNumber(e.required);

  if (n.level) {
    r["%level%"] = applyDescription("level_" + n.level);

    if (NG_LEVELS.includes(n.level)) {
      r["%level%"] += " NG";
    }

    if (e.required == 1) {
      r["%level%"] = applyDescription("level_" + n.level + "_article") + " " + r["%level%"];
    }
  }

  if (e.duration) {
    r["%duration%"] = Math.round(n.duration / 1000);
  }

  if (n.sizeX) {
    r["%size%"] = `${n.sizeX}x${n.sizeY}/${n.mines}`;
  }

  if (n.eff) {
    r["%eff%"] = n.eff + "%";
  }

  if (e.type === MSOQuestType.Arena) {
    const arena = getAreaType(e);
    r["%type%"] = "L" + arena.level + " " + applyDescription("arena_type_" + arena.type);
  }

  if (n.gem) {
    r["%gem%"] = applyDescription("gem_" + n.gem);
    r["%gems%"] = applyDescription("gems_" + n.gem);
  }
  if (e.type == MSOQuestType.PVP) {
    r["%pvp%"] = "PvP";
  }

  let l = "";

  if (PLURAL_QUESTS.includes(e.type)) {
    l = e.required == 1 ? "_single" : "_multiple";
  }

  let o = `${e.type}`;

  if (WIN_QUESTS.includes(e.type)) {
    o = "wins";
  } else if (EFF_QUESTS.includes(e.type)) {
    o = "eff";
  }

  return applyDescription("quests_" + o + l, r);
};

export const getAreaType = (quest: MsoQuestArena) => {
  const type = quest.options!.type;
  return {
    type: Math.floor((type - ARENA_OFFSET) / 10) as MsoArenaType,
    level: (type - ARENA_OFFSET) % 10,
  };
};
