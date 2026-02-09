export type QuestData = [string[], any[]];
export type QuestResponse = Array<QuestData>;

export const parseQuests = (data: QuestResponse) => {
  const recevied = arrayToObj(data[8]);
  const sent = arrayToObj(data[9]);

  return {
    recevied,
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
    return obj;
  });
};
