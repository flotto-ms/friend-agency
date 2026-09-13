import { MsoQuest } from "@flotto/types";
import TokenUtils from "../TokenUtils";

const getQuests = async (userId: number) => {
  const token = await TokenUtils.getToken("bot");
  let build = token.build;

  const server = "main" + (1 + (token.userId % 10));
  const url = `wss://${server}.minesweeper.online/mine-websocket/?authKey=${token.authKey}&session=${token.session}&userId=${token.userId}&EIO=4&transport=websocket`;

  return new Promise<MsoQuest[]>((accept, reject) => {
    const socket = new WebSocket(url);

    let data: MsoQuest[] | undefined = undefined;

    socket.onmessage = (m) => {
      const code = /^\d+/.exec(m.data)![0];
      if (code === "0") {
        socket.send("40");
      } else if (code === "42") {
        const obj = JSON.parse(m.data.substring(2));
        const creactChannel = () => {
          const cmd1 = `42["request",["GetNewExchangeDataWS",{"buyerId":${userId}},1000,${build}]]`;
          socket.send(cmd1);
        };

        const closeSocket = () => {
          socket.close();
          if (data) {
            accept(data);
          } else {
            reject(new Error("User not found"));
          }
        };

        if (obj[0] === "authorized") {
          creactChannel();
        } else if (obj[1][1] === "OldVersionEvent") {
          build++;
          console.log("Build", build);
          creactChannel();
        } else {
          data = parseResponse(obj[1][2][0]);
          closeSocket();
        }
      }
    };
  });
};

const parseResponse = (response: any) => {
  const user = response.buyerInfo;
  const quests = response.friendQuestData;

  const questIds = Object.entries(user.items)
    .filter(([key, value]) => key.length > 9 && key.startsWith("41") && (value as number) > 0)
    .map(([key]) => parseInt(key.substring(2)));

  return questIds.map((id) => quests[id] as MsoQuest);
};

export default {
  getQuests,
};
