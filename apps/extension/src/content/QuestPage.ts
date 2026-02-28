import { formatNumber } from "@flotto/utils";
import { getPrices } from "../utils/PriceData";
import type { FlottoQuestDetails } from "../../../../packages/types/src/flotto/FlottoQuestDetails";

const _observer = new MutationObserver((_) => injectPrices());

const injectPrices = () => {
  const questBlock = document.getElementById("QuestsBlock");
  const tables = [...questBlock!.querySelectorAll<HTMLTableElement>(".table")];
  if (tables.length === 3) {
    tables.shift();
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
      _observer.observe(container, { subtree: false, attributes: false, childList: true });
      injectPrices();
    }
  },
  unmount: () => {
    _observer.disconnect();
  },
};

export default QuestPage;
