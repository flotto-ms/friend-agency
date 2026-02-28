import { FlottoApi } from "./flotto/api";
import { updateQqs } from "./flotto/UpdateQQS";
import { connect, getQuests, getUserId } from "./minesweeper/api";
import { syncPrices } from "./utils/PriceData";

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
  const scripts = document.getElementsByTagName("script");
  let build = 0;
  for (let script of scripts) {
    const r = /\/index-(\d+)\.js/i.exec(script.src);
    if (r) {
      build = parseInt(r[1]);
      break;
    }
  }

  chrome.runtime.sendMessage({
    action: "startServer",
    payload: { session, build },
  });
}

const inject = (tabId: number) => {
  chrome.scripting
    .executeScript({ target: { tabId }, func: extractData })
    .catch(() => {});
};

chrome.tabs.onActivated.addListener(({ tabId }) => inject(tabId));

chrome.runtime.onMessage.addListener(({ action, payload }) => {
  if (action === "startServer") {
    connect(payload.session, payload.build).then((started) => {
      if (!started) {
        return;
      }

      syncPrices(getUserId());

      const pollServer = () => {
        getQuests()
          .then((quests) => {
            if (!quests) {
              return;
            }
            const qqs = quests.received.filter(
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
              received: quests.received,
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
});
