import { parseQuests, type QuestResponse } from "./questParser";

type Response<D> = [string, [number, number, D]];
type Callback = { accept: (data: any) => void; reject: (reason: any) => void };

let userId: number;
let requestId = 1000;
let socket: WebSocket | undefined = undefined;
let auth: any;
let currentSession: string;
let currentBuild: number;

const callbacks: Record<number, Callback> = {};

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
          if (data[0] == "server_error" && (data as any)[1] === "Wrong AuthKey") {
            auth = null;
            socket?.close();
            connect(currentSession, currentBuild);
          } else if (data[0] === "authorized") {
            accept();
          } else {
            processResponse(data);
          }
          break;
      }
    });
  });
};

const sendRequest = ({ action, cb, args }: { action: string; cb?: Callback; args?: any[] }) => {
  if (!socket || socket.readyState !== socket.OPEN) {
    cb?.reject(new Error("Socket not Open"));
    return;
  }
  const id = ++requestId;
  if (cb) {
    callbacks[id] = cb;
  }
  const request = ["request", [action, args ?? [], id, currentBuild]];
  socket.send(`42${JSON.stringify(request)}`);
};

export const connect = async (session: string, build: number) => {
  if (socket && currentBuild !== build) {
    socket.close();
    currentBuild = build;
    return false;
  }

  if (socket || !session) {
    return false;
  }

  currentSession = session;
  currentBuild = build;

  return new Promise<boolean>((accept, reject) => {
    fetch("https://minesweeper.online/authorize?session=" + session)
      .then((r) => r.json())
      .then((r) => {
        userId = r.userId;
        auth = r;
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
    sendRequest({
      action: "QuestsController.getQuestsWsAction",
      cb: {
        accept: (data: QuestResponse) => accept(parseQuests(data)),
        reject,
      },
    });
  });
};
