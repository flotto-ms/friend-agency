import { FlottoApi } from "./flotto/api";
import { updateQqs } from "./flotto/UpdateQQS";
import { connect, getQuests, getUserId } from "./minesweeper/api";

let pollInterval: ReturnType<typeof setInterval>;

chrome.scripting
  .registerContentScripts([
    {
      id: "flotto",
      matches: ["https://minesweeper.online/*"],
      css: ["style.css"],
      js: ["content.js"],
    },
  ])
  .catch(() => {
    //already registered
  });

function extractData() {
  const session = localStorage.getItem("_session");
  chrome.runtime.sendMessage({ action: "startServer", payload: { session } });
}

const inject = (tabId: number) => {
  chrome.scripting
    .executeScript({ target: { tabId }, func: extractData })
    .catch(() => {});
};

chrome.tabs.onActivated.addListener(({ tabId }) => inject(tabId));

chrome.runtime.onMessage.addListener(({ action, payload }) => {
  if (action === "startServer") {
    connect(payload.session).then((started) => {
      if (!started) {
        return;
      }

      const pollServer = () => {
        getQuests()
          .then((quests) => {
            if (!quests) {
              return;
            }
            const qqs = quests.recevied.filter(
              (quest) =>
                quest.completed === 0 &&
                !quest.expired &&
                quest.required !== quest.progress,
            ).length;
            const userId = getUserId();
            updateQqs({ pID: userId, QQS: qqs });

            FlottoApi.postSlots(userId, qqs);
            FlottoApi.postQuests(userId, {
              sent: quests.sent,
              received: quests.recevied,
            });
          })
          .catch((_) => {
            console.log("conneection closed");
          });
      };

      if (pollInterval) {
        clearInterval(pollInterval);
      }
      pollInterval = setInterval(pollServer, 30_000);
      pollServer();
    });
  }

  if (action === "sendData") {
    fetch(
      "https://script.google.com/macros/s/AKfycbxtrIVNsiKrttYjvTpn5QhULI1cDiEkof8maaLCr1X_Wn4OwaFc5vg7W2sjM0l-tHcN/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    ).catch(() => {});
  }
});
