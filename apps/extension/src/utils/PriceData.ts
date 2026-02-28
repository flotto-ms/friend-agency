import type { SaveQuestsResponse } from "@flotto/types";

export const getPrices = async () => {
  return chrome.storage.local
    .get(["prices"])
    .then((r) => r.prices as SaveQuestsResponse | undefined);
};

export const updatePrices = async (changes: SaveQuestsResponse) => {
  return getPrices().then((store) => {
    const newStore = structuredClone(store ?? { received: [], sent: [] });

    newStore.received = newStore.received.filter(
      (item) => !changes.received.find((change) => change.id === item.id),
    );
    newStore.sent = newStore.sent.filter(
      (item) => !changes.sent.find((change) => change.id === item.id),
    );

    changes.received.forEach((item) => newStore.received.push(item));
    changes.sent.forEach((item) => newStore.sent.push(item));

    return chrome.storage.local.set({ prices: newStore });
  });
};

export const syncPrices = (userId: number) => {
  getPrices().then((r) => {
    if (!r?.received || true) {
      console.log("load prices");
      fetch(
        `https://hls6ldikcd.execute-api.us-east-1.amazonaws.com/prod/users/${userId}/quests/prices`,
      )
        .then((r) => r.json())
        .then((result) => {
          return chrome.storage.local.set({ prices: result });
        });
    }
  });
};
