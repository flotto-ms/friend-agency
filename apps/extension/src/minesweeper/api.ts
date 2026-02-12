import { parseQuests, type QuestResponse } from "./questParser";

type Response<D> = [string, [number, number, D]];

let userId: number;
let requestId = 1000;
let socket: WebSocket | undefined = undefined;
let auth: any;
let currentSession: string;

const callbacks: Record<
  number,
  { accept: (data: any) => void; reject: (reason: any) => void }
> = {};

const processResponse = (data: Response<any>) => {
  if (data.length < 2 || !Array.isArray(data[1])) {
    return;
  }
  const cb = callbacks[data[1][0]];

  if (!cb) {
    return;
  }

  if (data[0] === "response") {
    cb.accept(data[1][2]);
  } else {
    cb.reject(data[1][2]);
  }

  delete callbacks[data[1][0]];
};

const reconnect = () => {
  socket = undefined;
  setTimeout(openSocket, 1_000);
};

const openSocket = async () => {
  return new Promise<void>((accept, reject) => {
    if (!auth || !currentSession) {
      reject("no session");
      return;
    }

    const url = `wss://main7.minesweeper.online/mine-websocket/?authKey=${auth.authKey}&session=${currentSession}&userId=${auth.userId}&EIO=4&transport=websocket`;
    try {
      socket = new WebSocket(url);
    } catch (ex) {
      console.error(ex);
      reconnect();
      reject("unnable to connect");
      return;
    }

    socket.addEventListener("close", () => {
      reconnect();
    });

    socket.addEventListener("message", (m) => {
      if (!m.data) {
        return;
      }

      const code = /^\d+/.exec(m.data)?.[0];
      switch (code) {
        case "0":
          socket?.send("40");
          break;
        case "2":
          socket?.send("3");
          break;
        default:
          const data: Response<any> = JSON.parse(m.data.substring(2));
          if (data[0] === "authorized") {
            accept();
          } else {
            processResponse(data);
          }
          break;
      }
    });
  });
};

export const connect = async (session: string) => {
  if (socket || !session) {
    return false;
  }

  return new Promise<boolean>((accept, reject) => {
    fetch("https://minesweeper.online/authorize?session=" + session)
      .then((r) => r.json())
      .then((r) => {
        userId = r.userId;
        auth = r;
        currentSession = session;
        return openSocket().then(() => accept(true));
      })
      .catch(reject);
  });
};

export const getUserId = () => userId;

export const getQuests = async () => {
  if (!socket) {
    return;
  }

  return new Promise<ReturnType<typeof parseQuests>>((accept, reject) => {
    if (!socket || socket.readyState !== socket.OPEN) {
      reject(new Error("Socket not Open"));
      return;
    }

    const id = ++requestId;
    callbacks[id] = {
      accept: (data: QuestResponse) => accept(parseQuests(data)),
      reject,
    };
    socket.send(
      `42["request",["QuestsController.getQuestsWsAction",[],${id},903]]`,
    );
  });
};
