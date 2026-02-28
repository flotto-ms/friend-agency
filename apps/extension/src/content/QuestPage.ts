import { formatNumber } from "@flotto/utils";
import { getPrices } from "../utils/PriceData";
import type { FlottoQuestDetails } from "../../../../packages/types/src/flotto/FlottoQuestDetails";

const _observer = new MutationObserver((_) => injectPrices());

const injectPrices = () => {
  const questBlock = document.getElementById("QuestsBlock");
  const tables = [...questBlock!.querySelectorAll<HTMLTableElement>(".table")];
  if (tables.length === 3) {
    tables.shift();
    //injectPricesIntoTest([230, 180, 215], quests!);
  }

  if (tables.length < 2) {
    return;
  }

  const [received, sent] = tables;

  getPrices().then((prices) => {
    if (!prices) {
      return;
    }

    injectPricesIntoTable(prices.received, received);
    injectPricesIntoTable(prices.sent, sent, "+");
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
