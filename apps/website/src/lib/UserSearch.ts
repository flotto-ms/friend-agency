type Response<D> = [string, [number, number, D] | string];
type CallbackArgs = Array<object | string | number>;
type Callback = {
  accept: (data: CallbackArgs) => void;
  reject: (reason: object) => void;
};
type Auth = { authKey: string; session: string; userId: number };

export type SearchResult = { id: number; username: string; country: string }[];

let requestId = 1000;
let socket: WebSocket | undefined = undefined;
let auth: Auth | undefined = undefined;

let currentBuild: number;
let connectTimeout: ReturnType<typeof setTimeout>;

const callbacks: Record<number, Callback> = {};

const processResponse = (data: Response<CallbackArgs>) => {
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
  if (connectTimeout) {
    clearTimeout(connectTimeout);
  }
  connectTimeout = setTimeout(openSocket, 1_000);
};

const openSocket = async () => {
  return new Promise<void>((accept, reject) => {
    if (!auth) {
      reject("no session");
      return;
    }

    const server = "main" + (1 + (auth.userId % 10));
    const url = `wss://${server}.minesweeper.online/mine-websocket/?authKey=${auth.authKey}&session=${auth.session}&userId=${auth.userId}&EIO=4&transport=websocket`;
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
          const data: Response<Array<object>> = JSON.parse(m.data.substring(2));
          if (data[0] == "server_error" && data[1] === "Wrong AuthKey") {
            socket?.close();
            connect();
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

const sendRequest = ({
  action,
  cb,
  args,
}: {
  action: string;
  cb?: Callback;
  args?: (object | string | number)[];
}) => {
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
const connect = async () => {
  if (socket) {
    return false;
  }

  if (connectTimeout) {
    clearTimeout(connectTimeout);
  }

  if (auth) {
    return openSocket();
  }

  return new Promise<boolean>((accept, reject) => {
    fetch("https://minesweeper.online/authorize?session=")
      .then((r) => r.json())
      .then((r) => {
        auth = r;
        return openSocket().then(() => accept(true));
      })
      .catch(reject);
  });
};

export const setAuth = (val: Auth, build: number) => {
  auth = val;
  currentBuild = build;
};

export const searchUsername = (val: string): Promise<SearchResult> => {
  return new Promise((accept, reject) => {
    connect().then(() => {
      sendRequest({
        action: "SearchController.searchWsAction",
        cb: {
          accept: (r) => {
            if (r.length === 0) {
              currentBuild++;
              searchUsername(val).then((r) => accept(r));
              return;
            }
            accept(r[0] as SearchResult);
          },
          reject,
        },
        args: [val],
      });
    });
  });
};
