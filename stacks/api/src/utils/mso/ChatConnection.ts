import TokenUtils, { TokenType } from "../TokenUtils";

type MsoUserDetails = {
  id: number;
  username: string;
  country: string;
};
type MsoMessage = {
  id: number;
  message: string;
  createdAt: string;
  channelId: number;
  userId: number;
  username: string;
  country: string;
};

type SendResult = {
  user: MsoUserDetails;
  message: MsoMessage;
};

type SendQueueItem = {
  userId: number;
  message: string;
  sent: (result: SendResult) => void;
  sendError: (error: Error) => void;
};
export type ChatConnection = {
  sendMessage: (userId: number, message: string) => Promise<SendResult>;
  close: () => void;
};

export const createConnection = async (type: TokenType) => {
  const token = await TokenUtils.getToken(type);
  let build = token.build;

  return new Promise<ChatConnection>((accept, reject) => {
    const socket = new WebSocket(
      `wss://chat1.minesweeper.online/mine-websocket/?authKey=${token.authKey}&session=${token.session}&userId=${token.userId}&EIO=4&transport=websocket`,
    );
    let queue: SendQueueItem[] = [];
    let user: MsoUserDetails | undefined = undefined;

    socket.onmessage = (m) => {
      const code = /^\d+/.exec(m.data)![0];
      if (code === "0") {
        socket.send("40");
      } else if (code === "42") {
        const obj = JSON.parse(m.data.substring(2));
        const processQueue = () => {
          const item = queue[0];
          socket.send(`42["request",["ChatController.createChannelWsAction",[${item.userId}],0,${build}]]`);
        };

        const controller: ChatConnection = {
          sendMessage: async (userId: number, message: string) => {
            return new Promise<SendResult>((sent, sendError) => {
              queue.push({ userId, message, sent, sendError });
              if (queue.length === 1) {
                processQueue();
              }
            });
          },
          close: () => {
            socket.close();
          },
        };

        if (obj[0] === "authorized") {
          accept(controller);
        } else if (obj[0] === "server_error") {
          reject(new Error("Server Error"));
        } else if (obj[1][2].length === 0) {
          build++;
          processQueue();
        } else {
          const response = obj[1][2] as any[];
          const item = queue[0];
          if (response.length === 1 && response[0].userId === token.userId) {
            item.sent({
              user: user!,
              message: response[0],
            });
            queue.shift();
            if (queue.length > 0) {
              user = undefined;
              processQueue();
            }
          } else if (
            response.length > 0 &&
            (response[0].user1Id == item.userId || response[0].user2Id == item.userId)
          ) {
            const channel = response[0];
            if (channel.user1Id == item.userId) {
              user = {
                id: channel.user1Id,
                username: channel.username1,
                country: channel.country1,
              };
            } else {
              user = {
                id: channel.user2Id,
                username: channel.username2,
                country: channel.country2,
              };
            }

            const payload = JSON.stringify([channel.id, item.message]);
            socket.send(`42["request",["ChatController.sendMessageWsAction",${payload},0,${build}]]`);
            socket.send(`42["request",["ChatController.closeChannelWsAction", ["${channel.id}"],0,${build}]]`);
          } else {
            console.log("response", response);
          }
        }
      }
    };
  });
};

export default {
  createConnection,
};
