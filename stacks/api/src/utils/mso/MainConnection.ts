import TokenUtils, { TokenType } from "../TokenUtils";

export type MainConnection = {
  getQuests: () => Promise<any>;
  getSendQuestData: (userId: number) => Promise<any>;
  close: () => void;
};

type GetSendQuestDataResponse = {};

type Request = {
  method: string;
  args: object | null;
  accept: (val: any) => void;
  reject: (val: any) => void;
};

export const createConnection = async (type: TokenType) => {
  const token = await TokenUtils.getToken(type);
  const server = "main" + (1 + (token.userId % 10));
  let build = token.build;
  let requestCount = 1000;

  return new Promise<MainConnection>((accept, reject) => {
    const socket = new WebSocket(
      `wss://${server}.minesweeper.online/mine-websocket/?authKey=${token.authKey}&session=${token.session}&userId=${token.userId}&EIO=4&transport=websocket`,
    );

    const requests: Record<number, Request> = {};

    const sendRequest = (requestId: number, method: string, args: object | null) => {
      const request = `42["request",[${JSON.stringify(method)},${JSON.stringify(args)},${requestId},${build}]]`;
      socket.send(request);
    };

    const queueRequest = (method: string, args: object | null = null): Promise<any> => {
      return new Promise((acceptRequest, rejectRequest) => {
        const requestId = requestCount++;
        requests[requestId.toString()] = { method, args, accept: acceptRequest, reject: rejectRequest };
        sendRequest(requestId, method, args);
      });
    };

    const createController = () => {
      const controller: MainConnection = {
        getQuests: () => queueRequest("GetQuestsWS"),
        getSendQuestData: (userId: number) => queueRequest("GetSendQuestDataWS", { userId }),
        close: () => socket.close(),
      };
      return controller;
    };

    socket.onmessage = (m) => {
      const code = /^\d+/.exec(m.data)![0];
      if (code === "0") {
        socket.send("40");
      } else if (code === "2") {
        socket.send("3");
      } else if (code === "42") {
        const obj = JSON.parse(m.data.substring(2));
        if (obj[0] === "authorized") {
          queueRequest("GetActiveDuelWS").then(() => {
            accept(createController());
          });
        } else if (obj[0] === "server_error") {
          reject(new Error("Server Error"));
        } else if (obj[0] === "response") {
          const requestId = obj[1][0];
          const eventType = obj[1][1];
          const response = obj[1][2];
          const request = requests[requestId.toString()];

          if (eventType === "OldVersionEvent") {
            build++;
            sendRequest(requestId, request.method, request.args);
          } else if (eventType === "ApiEvent") {
            delete requests[requestId];
            request.accept(response.length === 1 ? response[0] : response);
          } else {
            delete requests[requestId];
            request.reject(eventType);
          }
        }
      }
    };
  });
};

export default {
  createConnection,
};
