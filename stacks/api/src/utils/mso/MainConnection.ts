import { MsoQuest } from "@flotto/types";

export type MainConnection = {
  getQuests: () => Promise<any>;
  getSendFriendQuestData: (friendId: number) => Promise<GetSendFriendQuestDataResponse>;
  getNewExchangeData: (buyerId: number) => Promise<GetNewExchangeDataResponse>;
  close: () => void;
};

export type GetSendFriendQuestDataResponse = {
  friendData?: {
    id: number;
    username: string;
    country: string;
    allowFriendQuests: boolean;
  };
  isFull: boolean;
  favoriteContacts: { userId: number; username: string; country: string }[];
  isIncognito: boolean;
};

export type ExchangeUserInfo = {
  coins: number;
  items: Record<string, number> | null;
  eq: Record<string, number> | null;
  boosts: Record<string, number> | null;
  username: string;
  country: string;
  rep: number;
  ct: null;
  tokensUsed: Record<string, any>;
};

export type GetNewExchangeDataResponse = {
  isNotActive: boolean;
  isAccessDenied: boolean;
  exchange: {
    sellerId: number;
    buyerId: number;
    sellerCoins: number;
    sellerItems: Record<string, any> | null;
    buyerCoins: null;
    buyerItems: Record<string, any> | null;
  };
  sellerInfo: ExchangeUserInfo;
  buyerInfo: ExchangeUserInfo;
  sameIp: boolean;
  customTalentData: Record<
    string,
    {
      id: number;
      type: string;
      rarity: number;
      affixes: [number, number][];
      quality: number;
      reqs: number;
      exist: boolean;
    }
  > | null;
  friendQuestData: Record<string, MsoQuest>;
};

type Request = {
  method: string;
  args: object | null;
  accept: (val: any) => void;
  reject: (val: any) => void;
};

export type ConnectProps = {
  authKey: string;
  session: string;
  userId: number;
  build: number;
};

let build = 1033;

export const createConnection = async (token: ConnectProps) => {
  if (token.build > build) {
    build = token.build;
  }

  const server = "main" + (1 + (token.userId % 10));
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
        getSendFriendQuestData: (friendId: number) => {
          return queueRequest("GetSendFriendQuestDataWS", { friendId }).then(cleanFriendQuestData);
        },
        getNewExchangeData: (buyerId: number) => queueRequest("GetNewExchangeDataWS", { buyerId }),
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
          console.error("Server Error");
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
            request.reject(new Error(eventType));
          }
        }
      }
    };
  });
};

const cleanFriendQuestData = (r: GetSendFriendQuestDataResponse) => {
  if (r.friendData) {
    r.friendData.username = getUsername(r.friendData.id, r.friendData.username);
    r.friendData.country = getCountry(r.friendData.country);
  }
  if (r.favoriteContacts) {
    r.favoriteContacts.forEach((u) => {
      u.username = getUsername(u.userId, u.username);
      u.country = getCountry(u.country);
    });
  }
  return r;
};

const getUsername = (id: number, username?: string) => {
  if (username) {
    return username;
  }
  return `Anonymous${id}`;
};

const getCountry = (country?: string) => country ?? "XX";

export default {
  createConnection,
};
