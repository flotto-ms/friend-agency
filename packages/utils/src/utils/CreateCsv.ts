import type { MsoQuest } from "@flotto/types";
import { getQuestDescription } from "./QuestDescription";

let formatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export const createCSV = (quests: MsoQuest[], received: boolean) => {
  let completedPoints = 0;
  let expiredPoints = 0;
  let progressPoings = 0;

  const type = received ? "Receiver" : "Sender";
  const header = [
    "Date Sent (UTC)",
    "Expires at (UTC)",
    "Progress",
    "Level",
    "Description",
    "Reward",
    "Type",
    type + " ID",
    type + " Username",
    type + " Country",
  ];

  const rows = quests.map((quest) => {
    const expiresAt = quest.expiresAt ?? quest.reserveExpiresAt!;
    const createdAt = quest.createdAt ? new Date(quest.createdAt) : threeDaysAgo(expiresAt);
    const description = getQuestDescription(quest);
    const expires = new Date(expiresAt);
    const completed = quest.completed || quest.completedByInitiator || quest.progress === quest.required;
    const expired = !completed && expires < new Date();
    const eventPoints = quest.items?.["536"] ?? 0;

    if (completed) {
      completedPoints += eventPoints;
    } else if (expired) {
      expiredPoints += eventPoints;
    } else {
      progressPoings += eventPoints;
    }

    return [
      formatter.format(createdAt),
      formatter.format(expires),
      completed ? "Completed" : expired ? "Expired" : quest.required > 1 ? `${quest.progress}/${quest.required}` : "-",
      `L${quest.level}${quest.isElite ? "E" : ""}`,
      description,
      eventPoints,
      questType(description),
      received ? quest.initiatorId : quest.sentTo,
      quest.username,
      quest.country,
    ];
  });

  const data = [
    header,
    ...rows,
    header.map((_) => ""),
    ["Event points from completed quests: ", completedPoints, "", "", "", "", "", "", "", ""],
    ["Event points from quests in progress: ", progressPoings, "", "", "", "", "", "", "", ""],
    ["Event points not gained from expired quests: ", expiredPoints, "", "", "", "", "", "", "", ""],
  ];

  return data.map((row) => `"` + row.join(`","`) + `"`).join("\n");
};

const threeDaysAgo = (val: string) => {
  const date = new Date(val);
  date.setDate(date.getDate() - 3);
  return date;
};

const questType = (a: string) => {
  let b = "unknown";
  return (
    a.includes("in a row")
      ? (b = "Win Streak")
      : a.includes("custom")
        ? (b = "Custom")
        : a.includes("efficiency")
          ? (b = "Efficiency")
          : a.includes("with no flags")
            ? (b = "No Flags")
            : a.includes("arena at level")
              ? (b = "Arena Level")
              : a.includes("PvP")
                ? (b = "PvP")
                : a.includes("arena coin")
                  ? (b = "Arena Coins")
                  : a.includes("Complete") && a.includes("arena")
                    ? (b = "Arena Specific")
                    : a.includes("honor point") || a.includes("experience")
                      ? (b = "Experience")
                      : a.includes("minecoin")
                        ? (b = "Minecoins")
                        : a.includes("gem")
                          ? (b = "Gems")
                          : a.includes("Find")
                            ? (b = "Gem Specific")
                            : a.includes("game") && (b = "Wins"),
    b
  );
};
