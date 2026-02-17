import type { MsoQuest } from "@flotto/types";

export type QuestData = [string[], any[]];
export type QuestResponse = Array<QuestData>;

export const parseQuests = (data: QuestResponse) => {
  const unsent = data[7] as any[] as MsoQuest[];
  const received = arrayToObj(data[8]) as MsoQuest[];
  const sent = arrayToObj(data[9]) as MsoQuest[];

  return {
    unsent,
    received,
    sent,
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
    return ret;
  });
};
