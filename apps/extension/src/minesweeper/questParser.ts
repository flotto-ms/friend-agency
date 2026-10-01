import type { MsoQuest } from "@flotto/types";

export type QuestData = [string[], any[]];
export type QuestResponse = {
  newFriendQuests: QuestData;
  receivedFriendQuests: QuestData;
  sentFriendQuests: QuestData;
  allowFriendQuests: boolean;
};

export const parseQuests = (data: QuestResponse) => {
  return {
    unsent: arrayToObj(data.newFriendQuests),
    received: arrayToObj(data.receivedFriendQuests),
    sent: arrayToObj(data.sentFriendQuests),
  };
};

const arrayToObj = (array: QuestData) => {
  const fields = array[0];
  return array[1].map((record) => {
    const obj: any = {};
    record.forEach((val: any, i: number) => {
      obj[fields[i]] = val;
    });

    const ret: any = {};
    Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => (ret[key] = obj[key]));
    return ret as MsoQuest;
  });
};
