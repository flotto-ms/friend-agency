import { MsoQuest } from "@flotto/types";
import TokenUtils from "../TokenUtils";

const getSendQuestData = async (userId: number) => {
  const token = await TokenUtils.getToken("bot");
  let build = token.build;

  const server = "main" + (1 + (token.userId % 10));
  const url = `wss://${server}.minesweeper.online/mine-websocket/?authKey=${token.authKey}&session=${token.session}&userId=${token.userId}&EIO=4&transport=websocket`;

  return new Promise<MsoQuest[]>((accept, reject) => {
    const socket = new WebSocket(url);

    let data: MsoQuest[] | undefined = undefined;

    socket.onmessage = (m) => {
      const code = /^\d+/.exec(m.data)![0];
      console.log(m);
      if (code === "0") {
        socket.send("40");
      } else if (code === "42") {
        const obj = JSON.parse(m.data.substring(2));
        const creactChannel = () => {
          const cmd1 = `42["request",["GetSendQuestDataWS",{"userId":${userId}},1000,${build}]]`;
          console.log(cmd1);
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
          console.log(obj);
          data = parseResponse(obj[1][2][0]);
          closeSocket();
        }
      }
    };
  });
};

const parseResponse = (response: any) => {
  console.log(response);
  return response;
};

export default {
  getSendQuestData,
};
