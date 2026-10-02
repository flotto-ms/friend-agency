import { getAreaType, getFlottoQuestType } from "@flotto/utils";
import { FlottoApi } from "./flotto/api";
import { connect, getQuests, getUserId } from "./minesweeper/api";
import { loadContracts } from "./utils/ContractData";
import { syncPrices } from "./utils/PriceData";
import { getUserStatus } from "./utils/QqsData";
import { type GetContractsResponse, type MsoQuest, type MsoQuestCustomOptions } from "@flotto/types";

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

const contractMatchesQuest = (contract: GetContractsResponse["contracts"][number], quest: MsoQuest) => {
  if (contract.type !== getFlottoQuestType(quest)) {
    return false;
  }

  if (!contract.filter) {
    return true;
  }

  if (contract.filter.level) {
    const filter = contract.filter.level;
    const level = quest.level * (quest.isElite ? 3 : 1);
    if (!(filter.min <= level && level <= filter.max)) {
      return false;
    }
  }

  if (contract.filter.required) {
    const filter = contract.filter.required;
    const required = quest.required;
    if (!(filter.min <= required && required <= filter.max)) {
      return false;
    }
  }

  if (contract.filter.arenaLevel && quest.options) {
    const arena = getAreaType(quest);
    const filter = contract.filter.arenaLevel;
    if (!(filter.min <= arena.level && arena.level <= filter.max)) {
      return false;
    }
  }

  if (contract.filter.efficiency && quest.options) {
    const filter = contract.filter.efficiency;
    const eff = quest.options.eff as number;
    if (!(filter.min <= eff && eff <= filter.max)) {
      return false;
    }
  }

  if (contract.filter.density && quest.options) {
    const options: MsoQuestCustomOptions = quest.options as any;
    const width = options.sizeX;
    const height = options.sizeY;
    const mines = options.mines;

    const percent = (mines / (width * height)) * 100;
    const filter = contract.filter.density;
    if (!(filter.min <= percent && percent <= filter.max)) {
      return false;
    }
  }

  return true;
};

const getContracts = async () => {
  return Promise.all([getQuests().then((r) => r?.unsent ?? []), loadContracts()]).then(
    async ([unsent, contracts = []]) => {
      const unsentContracts = unsent.map((quest) => {
        const type = getFlottoQuestType(quest);

        const questContracts = contracts
          .filter((c) => c.type === type && c.userId !== quest.initiatorId)
          .sort((a, b) => b.price - a.price);

        return {
          id: quest.id,
          contracts: questContracts.filter((c) => contractMatchesQuest(c, quest)),
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
