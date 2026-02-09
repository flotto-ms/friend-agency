import { parseQuests, type QuestResponse } from "./questParser";

type Response<D> = [string, [number, number, D]];

let requestId = 1000;
let socket: WebSocket | undefined = undefined;

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

export const connect = async () => {
  const session = localStorage.getItem("_session");

  if (!session) {
    return false;
  }
  return new Promise((accept, reject) => {
    fetch("/authorize?session=" + session)
      .then((r) => r.json())
      .then((r) => {
        const url = `wss://main7.minesweeper.online/mine-websocket/?authKey=${r.authKey}&session=${session}&userId=${r.userId}&EIO=4&transport=websocket`;
        socket = new WebSocket(url);

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
                accept(socket);
              } else {
                processResponse(data);
              }
              break;
          }
        });
      })
      .catch(reject);
  });
};

export const getQuests = async () => {
  if (!socket) {
    return;
  }

  return new Promise((accept, reject) => {
    if (!socket) {
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
