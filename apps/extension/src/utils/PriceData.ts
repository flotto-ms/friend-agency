import type { SaveQuestsResponse } from "@flotto/types";

export const getPrices = async () => {
  return chrome.storage.local.get(["prices"]).then((r) => r.prices as SaveQuestsResponse | undefined);
};

export const syncPrices = () => {
  getPrices().then((r) => {
    if (!r?.received || true) {
      console.log("load prices");
      fetch("https://hls6ldikcd.execute-api.us-east-1.amazonaws.com/prod/users/11698196/quests/prices")
        .then((r) => r.json())
        .then((result) => {
          return chrome.storage.local.set({ prices: result });
        });
    }
  });
};
