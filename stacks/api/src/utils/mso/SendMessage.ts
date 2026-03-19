const p = ["authKey", "session", "userId"];
const r: Record<string, string | number | boolean> = {
  authKey: "a033482728c2ecd9745ee0848378e53a",
  session: "36d134d3b7989deb39127953a63d0c26",
  userId: 50609406,
  serverTime: 1772616924903,
  isNewUser: false,
  walletEnabled: false,
};

const sendMessage = async (userId: number, message: string, build: number) => {
  return new Promise<void>((accept) => {
    const socket = new WebSocket(
      `wss://chat1.minesweeper.online/mine-websocket/?${p.map((k) => `${k}=${r[k]}`).join("&")}&EIO=4&transport=websocket`,
    );

    let done = false;
    socket.onmessage = (m) => {
      const code = /^\d+/.exec(m.data)![0];
      if (code === "0") {
        socket.send("40");
      } else if (code === "42") {
        const obj = JSON.parse(m.data.substring(2));
        console.log(m.data);
        if (obj[0] === "authorized") {
          socket.send(
            `42["request",["ChatController.sendMessageWsAction",${JSON.stringify([userId, message])},0,${build}]]`,
          );
          socket.send(`42["request",["ChatController.closeChannelWsAction", ["${userId}"],0,${build}]]`);
          //done = true;
        } else if (done) {
          socket.close();
          accept();
        }
      }
    };
  });
};

export default {
  sendMessage,
};
