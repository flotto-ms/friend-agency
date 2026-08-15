import { getAreaType, getFlottoQuestType } from "@flotto/utils";
import { FlottoApi } from "./flotto/api";
import { updateQqs } from "./flotto/UpdateQQS";
import { connect, getQuests, getUserId, getUserQQS } from "./minesweeper/api";
import { loadContracts } from "./utils/ContractData";
import { syncPrices } from "./utils/PriceData";
import { getUserStatus } from "./utils/QqsData";
import { FlottoQuestType, MSOQuestType } from "@flotto/types";

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
  chrome.scripting.executeScript({ target: { tabId }, func: extractData }).catch(() => {});
};

const startServer = (session: string, build: number) => {
  connect(session, build).then((started) => {
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
            (quest) => quest.completed === 0 && !quest.expired && quest.required !== quest.progress,
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
};

const getContracts = async () => {
  return Promise.all([getQuests().then((r) => r?.unsent ?? []), loadContracts()]).then(
    async ([unsent, contracts = []]) => {
      const unsentContracts = unsent.map((quest) => {
        const type = getFlottoQuestType(quest);
        let arena = quest.type === MSOQuestType.Arena ? getAreaType(quest) : undefined;
        const userIds = new Set<number>();

        const questContracts = contracts
          .filter((c) => c.type === type && c.userId !== quest.initiatorId)
          .sort((a, b) => b.price - a.price);

        if (quest.id === 29409344) {
          console.log(questContracts);
        }

        return {
          id: quest.id,
          contracts: questContracts.filter((c) => {
            if (userIds.has(c.userId)) {
              return false;
            }

            if (!c.filter) {
              if (c.userId === 6798490) {
                console.log(c);
              }
              //userIds.add(c.userId);
              return true;
            }

            let valid = false;

            if (c.filter.level) {
              const filter = c.filter.level;
              const level = quest.level * (quest.isElite ? 3 : 1);
              valid = filter.min <= level && level <= filter.max;

              if (c.userId === 6798490) {
                console.log(valid, c, level, filter);
              }
            }

            if (c.filter.arenaLevel && arena) {
              const filter = c.filter.arenaLevel;
              valid = filter.min <= arena.level && arena.level <= filter.max;
            }

            if (valid) {
              //userIds.add(c.userId);
            }

            return valid;
          }),
          bestPrice: 0,
        };
      });

      for (let q of unsentContracts) {
        for (let price of q.contracts) {
          const user = await getUserStatus(price.userId);
          if (user?.isAccepting && !user.isFull) {
            q.bestPrice = price.price;
            break;
          }
        }
      }

      return unsentContracts;
    },
  );
};

chrome.tabs.onActivated.addListener(({ tabId }) => inject(tabId));

chrome.runtime.onMessage.addListener(({ action, payload }, sender, sendResponse) => {
  switch (action) {
    case "startServer":
      startServer(payload.session, payload.build);
      return;
    case "initPopover":
      chrome.scripting
        .executeScript({
          target: { tabId: sender.tab!.id! },
          world: "MAIN",
          func: () => (window as any).$('[data-flotto="popover"]').popover(),
        })
        .catch(() => {});
      return;
    case "getUserStatus":
      getUserStatus(payload.userId)
        .then((status) => sendResponse({ status }))
        .catch(() => sendResponse({}));
      return true;
    case "getContracts":
      getContracts().then((contracts) => sendResponse({ contracts }));
      return true;
  }
});
