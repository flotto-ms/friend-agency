import { formatNumber } from "@flotto/utils";
import { getPrices } from "../utils/PriceData";
import type { FlottoQuestDetails } from "../../../../packages/types/src/flotto/FlottoQuestDetails";
import type { SaveQuestsResponse } from "@flotto/types";

const _observer = new MutationObserver((_) => injectPrices());

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

const injectPrices = () => {
  const questBlock = document.getElementById("QuestsBlock");
  const tables = [...questBlock!.querySelectorAll<HTMLTableElement>(".table")].filter((tbl) => {
    const thead = tbl.querySelector<HTMLTableElement>("thead tr")!;
    return thead.childNodes.length > 5;
  });

  const [received, sent] = tables;

  const header = questBlock?.querySelector('[data-flotto="header"]');

  getPrices().then((prices) => {
    if (!prices) {
      return;
    }

    if (received) injectPricesIntoTable(prices.received, received);
    if (sent) injectPricesIntoTable(prices.sent, sent, "+");

    if (!header) {
      injectSummary(prices);
    }
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

const injectPricesIntoTest = (prices: number[], table: HTMLTableElement) => {
  if (table.getAttribute("data-flotto")) {
    return;
  }
  table.setAttribute("data-flotto", "set");

  const head = table.querySelectorAll<HTMLTableRowElement>("thead tr")[0];
  const th = document.createElement("th");
  th.innerText = "Flotto";
  th.classList.add("text-nowrap");
  head.insertBefore(th, head.childNodes[3]);

  table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row, i) => {
    const price = prices[i];

    const td = document.createElement("td");
    td.classList.add("text-nowrap");

    if (price > 0) {
      td.innerHTML = `<span class="text-nowrap-inline">${formatNumber(price)} / ❤️</span>`;
    } else {
      td.innerText = "—";
    }
    row.insertBefore(td, row.childNodes[2]);
  });
};

const injectPricesIntoTable = (
  prices: { id: number; flotto: FlottoQuestDetails }[],
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

    const td = document.createElement("td");
    td.classList.add("text-nowrap");

    if ((price?.flotto.price ?? 0) > 0) {
      td.appendChild(createMcElement(price!.flotto.price!, pricePrefix));
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

const createMcElement = (amount: number, prefix = "") => {
  const mc = document.createElement("div");
  mc.innerHTML = `<span class="text-nowrap-inline">${prefix}${formatNumber(amount)} <img src="/img/other/coin.svg" class="coin-icon icon-right icon-small" alt="🟡"></span>`;
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
  },
  unmount: () => {
    _observer.disconnect();
  },
};

export default QuestPage;
