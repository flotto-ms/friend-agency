import { formatNumber } from "@flotto/utils";
import { getPrices } from "../utils/PriceData";
import type { FlottoQuestDetails } from "../../../../packages/types/src/flotto/FlottoQuestDetails";
import type { MsoQuest, SaveQuestsResponse } from "@flotto/types";
import type { QuestContract, QuestContracts } from "../utils/ContractData";
import { type UserStatus } from "../minesweeper/api";

let selectedContracts: QuestContracts | undefined;
let contractInterval: ReturnType<typeof setInterval> | undefined = undefined;

const _observer = new MutationObserver((_) => injectPrices());
const _modalObserver = new MutationObserver((_) => injectContractors());

const headerTemplate = `
  <div data-flotto="header"><table><tbody><tr><td style="width: 100%;"><h2 class="">Flotto Wallet (Estimate)</h2></td><td><h2 class="events-title"><span class="season help gray" title="" data-original-title="Flotto Season S7">[S7]</span></h2></td></tr></tbody></table><hr class="event-hr"></div>
  <table class="table table-bordered" data-flotto="set"><thead><tr><th class="text-nowrap quest-column">Description</th><th class="text-nowrap">Amount</th></tr></thead><tbody>
    <tr><td>Quests Sold</td><td class="text-nowrap" id="flotto-sold"></td></tr>
    <tr><td>Quests Purchased</td><td class="text-nowrap" id="flotto-purchased"></td></tr>
    <tr><td>Contractor Fees * (5%)</td><td class="text-nowrap" id="flotto-fees"></td></tr>
    <tr><th>Balance</th><th class="text-nowrap" id="flotto-total"></div></td></tr>
  </tbody></table>
  <div><p class="text-nowrap transparent">* Agency fees can be offset by end of <a id="flotto-show">season rewards</a>.</p></div>
  <table id="flotto-reward" style="display:none" class="table table-bordered" data-flotto="set"><thead><tr><th class="text-nowrap quest-column">Tier</th><th class="text-nowrap">Event Points Sent</th><th class="text-nowrap">Reward</th></tr></thead><tbody>
    <tr><td>Tier 1</td><td class="text-nowrap">2 000 EP</td><td class="text-nowrap">2 000 <img src="/img/other/coin.svg" class="coin-icon icon-right icon-small" alt="🟡"></td></tr>
    <tr><td>Tier 2</td><td class="text-nowrap">4 000 EP</td><td class="text-nowrap">5 000 <img src="/img/other/coin.svg" class="coin-icon icon-right icon-small" alt="🟡"></td></tr>
    <tr><td>Tier 3</td><td class="text-nowrap">7 000 EP</td><td class="text-nowrap">10 000 <img src="/img/other/coin.svg" class="coin-icon icon-right icon-small" alt="🟡"></td></tr>
    <tr><td>Tier 4</td><td class="text-nowrap">10 000 EP</td><td class="text-nowrap">15 000 <img src="/img/other/coin.svg" class="coin-icon icon-right icon-small" alt="🟡"></td></tr>
    <tr><td>Tier 5</td><td class="text-nowrap">15 000 EP</td><td class="text-nowrap">30 000 <img src="/img/other/coin.svg" class="coin-icon icon-right icon-small" alt="🟡"></td></tr>
  </tbody></table>
`;

let modalTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
const injectContractors = () => {
  if (modalTimeout) clearTimeout(modalTimeout);

  modalTimeout = setTimeout(async () => {
    const modal = document.getElementById("SendQuestDialog");
    if (modal?.getAttribute("class") === "modal fade" || !selectedContracts) {
      selectedContracts = undefined;
      return;
    }

    const content = modal?.querySelector("#send_quest_content > div");
    const sendButton = content?.childNodes[1].firstChild as HTMLLinkElement;

    const links = document.createElement("div");
    const users = new Set<number>();

    for (let contract of selectedContracts.contracts) {
      if (users.has(contract.userId)) {
        break;
      }
      users.add(contract.userId);
      const link = await createContractorLink(contract, sendButton);
      if (link) {
        links.append(link);
      }
    }
    links.className = "send-quest-option";

    const before = content?.childNodes[2]!;
    content?.insertBefore(links, before);

    const head = document.createElement("div");
    head.className = "send-quest-option";
    head.innerText = "Available Flotto Contractors";
    content?.insertBefore(head, links);
  }, 250);
};

const injectPrices = () => {
  const questBlock = document.getElementById("QuestsBlock");
  const tables = [...questBlock!.querySelectorAll<HTMLTableElement>(".table")];

  const [received, sent] = tables.filter((tbl) => {
    const thead = tbl.querySelector<HTMLTableElement>("thead tr")!;
    return thead.childNodes.length > 5;
  });

  const unsent = tables.find((tbl) => {
    const thead = tbl.querySelector<HTMLTableElement>("thead tr")!;
    return thead.childNodes.length == 5;
  });

  const header = questBlock?.querySelector('[data-flotto="header"]');

  getPrices().then(async (prices) => {
    if (!prices) {
      return;
    }
    const quests = (await chrome.storage.local.get(["quests"])).quests as any;

    if (received) injectPricesIntoTable(prices.received, quests.received, received);
    if (sent) injectPricesIntoTable(prices.sent, quests.sent, sent, "+");
    if (unsent) injectPricesIntoUnsent(unsent);

    if (!header) {
      injectSummary(prices);
    }

    chrome.runtime.sendMessage({
      action: "initPopover",
      payload: {},
    });
  });
};

const injectSummary = (prices: SaveQuestsResponse) => {
  const sold = prices.sent.reduce((a, c) => a + (c?.flotto?.price ?? 0), 0);
  const purchased = prices.received.reduce((a, c) => a + (c?.flotto?.price ?? 0), 0);
  const fees = Math.round(purchased * 0.05);
  const total = sold - purchased - fees;

  if (purchased === 0 && sold === 0) {
    return;
  }

  const questBlock = document.getElementById("QuestsBlock");
  const div = document.createElement("div");
  div.innerHTML = headerTemplate.trim();

  questBlock?.prepend(...div.childNodes);

  document.getElementById("flotto-sold")?.append(sold === 0 ? "—" : createMcElement(sold, "+"));
  document.getElementById("flotto-purchased")?.append(purchased === 0 ? "—" : createMcElement(purchased, "-"));
  document.getElementById("flotto-fees")?.append(fees === 0 ? "—" : createMcElement(fees, "-"));
  document.getElementById("flotto-total")?.append(total === 0 ? "—" : createMcElement(total));

  document.getElementById("flotto-show")?.addEventListener("click", (e) => {
    const reward = document.getElementById("flotto-reward")!;
    if (reward.style.display === "none") {
      reward.style.removeProperty("display");
    } else {
      reward.style.display = "none";
    }
  });
};

const injectPricesIntoUnsent = (table: HTMLTableElement) => {
  if (table.getAttribute("data-flotto")) {
    return;
  }
  table.setAttribute("data-flotto", "set");

  const head = table.querySelectorAll<HTMLTableRowElement>("thead tr")[0];
  const th = document.createElement("th");
  th.innerText = "Flotto Rate";
  th.classList.add("text-nowrap");
  head.insertBefore(th, head.childNodes[3]);

  table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row, i) => {
    const td = document.createElement("td");
    td.classList.add("text-nowrap");
    td.innerText = "—";
    row.insertBefore(td, row.childNodes[2]);
  });

  const initContracts = () => {
    chrome.runtime
      .sendMessage({
        action: "getContracts",
        payload: {},
      })
      .then((response: { contracts: QuestContracts[] }) => {
        response.contracts.forEach((c) => {
          if (c.bestPrice === 0) {
            return;
          }

          const cell = table.querySelectorAll(`#quest_row_${c.id} td`)[2];
          const button = table.querySelector(`#quest_row_${c.id} button`);
          cell.textContent = "";
          if (cell.firstElementChild) cell.removeChild(cell.firstElementChild!);
          cell.append(createMcElement(c.bestPrice));

          cell.addEventListener("mouseover", async () => {
            const span = cell.querySelector("span");

            if (!span || span.getAttribute("data-toggle")) {
              return;
            }
            span?.setAttribute("data-toggle", "popover");

            let content = `<table class="table table-bordered" style="margin:0;zoom:0.9">`;
            for (let item of c.contracts) {
              content += await createContractRow(item);
            }
            content += "</tableclass>";

            span?.setAttribute("data-trigger", "hover");
            span?.setAttribute("data-html", "true");
            span?.setAttribute("data-animation", "true");
            span?.setAttribute(
              "data-content",
              `<div class="custom-popover-content"><strong>Flotto Contracts</strong><hr class="narrow-hr"/> ${content}</div>`,
            );
            span?.setAttribute("data-flotto", "popover");

            chrome.runtime.sendMessage({
              action: "initPopover",
              payload: {},
            });
          });

          button?.addEventListener("click", () => {
            selectedContracts = c;
          });
        });
      });
  };

  if (contractInterval) {
    clearInterval(contractInterval);
  }
  contractInterval = setInterval(initContracts, 60_000);
  initContracts();
};

const injectPricesIntoTable = (
  prices: { id: number; flotto: FlottoQuestDetails }[],
  quests: MsoQuest[],
  table: HTMLTableElement,
  pricePrefix: string = "",
) => {
  if (table.getAttribute("data-flotto")) {
    return;
  }
  table.setAttribute("data-flotto", "set");

  const head = table.querySelectorAll<HTMLTableRowElement>("thead tr")[0];
  const th = document.createElement("th");
  th.innerText = "Flotto";
  th.classList.add("text-nowrap");
  head.insertBefore(th, head.childNodes[4]);

  table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row) => {
    const id = parseInt(row.id.replace("quest_row_", ""));
    const price = prices.find((e) => e.id === id);
    const quest = quests.find((q) => q.id === id);

    const td = document.createElement("td");
    td.classList.add("text-nowrap");

    if ((price?.flotto.price ?? 0) > 0 && quest) {
      const amount = price!.flotto.price!;
      const levels = quest!.level * (quest!.isElite ? 3 : 1);

      td.appendChild(
        createMcElement(amount, pricePrefix, {
          title: "Flotto",
          content: `<div class="text-nowrap"><p>This quest was contracted on flotto<br />at the following rate: </p><p> ${createMcElement(amount / levels).innerHTML} &nbsp; per level</p></div>`,
        }),
      );
    } else if (price?.flotto.status === "Inactive") {
      td.innerText = "No Contract";
    } else {
      td.innerText = "—";
    }
    row.insertBefore(td, row.childNodes[3]);

    const date = row.childNodes[6] as HTMLTableCellElement;
    const reg = /^(\d+ )(\w+) (.+)/.exec(date.innerText);
    if (reg) {
      const btn = date.querySelector("button");
      date.childNodes[0].textContent = `${reg[1]}${reg[2].substring(0, 3)} ${reg[3]}`;
      if (btn) date.childNodes[0].appendChild(btn);
    }
  });
};

const createContractRow = async (c: QuestContract) => {
  return chrome.runtime
    .sendMessage({
      action: "getUserStatus",
      payload: { userId: c.userId },
    })
    .then((response: { status: UserStatus }) => {
      const status = response.status;
      if (!status) return "";
      const elem = document.createElement("div");
      elem.textContent = status.username;

      return `<tr><td class="text-nowrap"><nobr><img src="/img/flags/${status.country.toLowerCase()}.png" class="player-flag help"><a>${elem.innerHTML}</a></nobr></td><td class="text-nowrap">${c.price}</td><td class="text-nowrap">${getStatus(status!)}</td></tr>`;
    });
};

const createContractorLink = async (c: QuestContract, sendButton: HTMLLinkElement) => {
  return chrome.runtime
    .sendMessage({
      action: "getUserStatus",
      payload: { userId: c.userId },
    })
    .then((response: { status: UserStatus }) => {
      const status = response.status;
      if (!status || !status.isAccepting || status.isFull) return;
      const elem = document.createElement("a");
      const span = document.createElement("span");

      elem.innerHTML = `<img src="/img/flags/${status.country.toLowerCase()}.png" class="player-flag"/>`;
      span.innerText = status.username;
      elem.append(span);
      elem.href = "javascript:void(0);";

      const mc = createMcElement(c.price).firstElementChild! as HTMLElement;

      elem.append(mc);
      mc.prepend(" @ ");
      elem.style.display = "inline-block";
      elem.style.marginRight = "10px";

      mc.style.display = "inline-block";
      mc.style.marginLeft = "5px";

      elem.addEventListener("click", () => {
        try {
          sendButton.click();
        } catch {}

        setTimeout(() => {
          const input = document.querySelector("#SendQuestDialog #user_autocomplete") as HTMLInputElement;
          input.value = status.username;
          const button = input.closest("#SearchBlock")!.querySelector("button");
          button!.click();
        }, 50);
      });
      return elem;
    });
};

const getStatus = (status: UserStatus) => {
  if (!status.isAccepting || status.isFull) {
    return `<i class="fa fa-circle new-quest-icon"></i>`;
  }
  return `<i class="fa fa-circle icon-online"></i>`;
};

const createMcElement = (amount: number, prefix = "", popover?: { title: string; content: string } | undefined) => {
  const mc = document.createElement("div");
  mc.innerHTML = `<span class="text-nowrap-inline">${prefix}${formatNumber(amount)} <img src="/img/other/coin.svg" class="coin-icon icon-right icon-small" alt="🟡"></span>`;
  if (popover) {
    const span = mc.firstElementChild;
    span?.setAttribute("data-flotto", "popover");
    span?.setAttribute("data-toggle", "popover");
    span?.setAttribute("data-trigger", "hover");
    span?.setAttribute("data-placement", "top");
    span?.setAttribute("data-html", "true");
    span?.setAttribute("data-animation", "true");
    span?.setAttribute(
      "data-content",
      `<div class="custom-popover-content popover-min-width"><strong>${popover.title}</strong><hr class="narrow-hr"/> ${popover.content}</div>`,
    );
  }
  return mc;
};

const QuestPage = {
  path: "/friend-quests",
  mount: () => {
    const container = document.getElementById("QuestsBlock");
    if (container) {
      _observer.observe(container, {
        subtree: false,
        attributes: false,
        childList: true,
      });
      injectPrices();
    }

    const modal = document.getElementById("SendQuestDialog");
    if (modal) {
      _modalObserver.observe(modal, {
        subtree: false,
        attributes: true,
        childList: true,
      });
      injectPrices();
    }
  },
  unmount: () => {
    if (contractInterval) {
      clearInterval(contractInterval);
    }

    _observer.disconnect();
    _modalObserver.disconnect();
  },
};

export default QuestPage;
