import TokenUtils, { TokenResponse } from "../TokenUtils";

const p: (keyof TokenResponse)[] = ["authKey", "session", "userId"];

type MsoUserDetails = {
  id: number;
  username: string;
  country: string;
};

const sendMessage = async (userId: number, message: string, build: number) => {
  const token = await TokenUtils.getToken("bot");

  let channelId = 0;
  let user: MsoUserDetails | undefined = undefined;
  return new Promise<MsoUserDetails>((accept, reject) => {
    const socket = new WebSocket(
      `wss://chat1.minesweeper.online/mine-websocket/?${p.map((k) => `${k}=${token[k]}`).join("&")}&EIO=4&transport=websocket`,
    );

    let done = false;

    socket.onmessage = (m) => {
      const code = /^\d+/.exec(m.data)![0];
      if (code === "0") {
        socket.send("40");
      } else if (code === "42") {
        const obj = JSON.parse(m.data.substring(2));
        const creactChannel = () => {
          const createCommand = `42["request",["ChatController.createChannelWsAction",[${userId}],0,${build}]]`;
          socket.send(createCommand);
        };

        const closeSocket = () => {
          socket.close();
          if (user) {
            accept(user);
          } else {
            reject(new Error("User not found"));
          }
        };

        if (obj[0] === "authorized") {
          creactChannel();
        } else if (done) {
          closeSocket();
        } else if (obj[1][2].length === 0) {
          build++;
          creactChannel();
        } else if (channelId === 0) {
          const channel = obj[1][2][0];
          channelId = channel.id;
          user = {
            id: channel.user1Id,
            username: channel.username1,
            country: channel.country1,
          };
          const cmd1 = `42["request",["ChatController.sendMessageWsAction",${JSON.stringify([channelId, message])},1,${build}]]`;
          socket.send(cmd1);
          const cmd2 = `42["request",["ChatController.closeChannelWsAction", ["${channelId}"],2,${build}]]`;
          socket.send(cmd2);
          done = true;
          closeSocket();
        }
      }
    };
  });
};

export default {
  sendMessage,
};
