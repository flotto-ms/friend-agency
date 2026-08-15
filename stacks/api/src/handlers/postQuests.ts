import type { MsoQuest } from "@flotto/types";
import { APIGatewayProxyEvent } from "aws-lambda";

export type QuestData = [string[], any[]];
export type QuestRequest = { received: QuestData; sent: QuestData };

export const handler = async (event: APIGatewayProxyEvent) => {
  console.debug(JSON.stringify(event, null, 2));
  const data: QuestRequest = JSON.parse(event.body ?? "{}");
  const response = parseQuests(data);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response),
  };
};

export const parseQuests = (data: QuestRequest) => {
  const received = arrayToObj(data.received) as MsoQuest[];
  const sent = arrayToObj(data.sent) as MsoQuest[];

  return {
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
