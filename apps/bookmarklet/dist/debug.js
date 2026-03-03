(() => {
  const c = ["minesweeper.online", "session", "authorize", "websocket", "text/json"];
  if (window.location.hostname !== c[0]) {
    alert(`This bookmarklet shuold only be run on https://${c[0]}`);
    return;
  }
  const src = [...document.getElementsByTagName("script")].find((s) => s.src.match(/\/index-(\d+)\.js/)).src;
  const build = /\/index-(\d+)\.js/i.exec(src)[1];
  const p = ["authKey", c[1], "userId"];
  fetch(`https://${c[0]}/${c[2]}?${c[1]}=${localStorage.getItem("_" + c[1])}`)
    .then((r) => r.json())
    .then((r) => {
      const server = "main" + (1 + (r.userId % 2510));
      const socket = new WebSocket(
        `wss://${server}.${c[0]}/mine-${c[3]}/?${p.map((k) => `${k}=${r[k]}`).join("&")}&EIO=4&transport=${c[3]}`,
      );
      socket.onmessage = (m) => {
        const code = /^\d+/.exec(m.data)[0];
        if (code === "0") {
          socket.send("40");
        } else if (code === "42") {
          const obj = JSON.parse(m.data.substring(2));
          if (obj[0] === `${c[2]}d`) {
            socket.send(`42["request",["QuestsController.getQuestsWsAction",[],1001,${build}]]`);
          } else {
            const quests = obj[1][2];
            const exp = { sent: quests[8], recevied: quests[9] };
            const a = document.createElement("a");
            a.download = `flotto-${new Date().toISOString().substring(0, 10)}.json`;
            a.href = URL.createObjectURL(new Blob([JSON.stringify(exp)], { type: c[4] }));
            a.dataset.downloadurl = [c[4], a.download, a.href].join(":");
            a.click();
            socket.close();
          }
        }
      };
    });
})();
