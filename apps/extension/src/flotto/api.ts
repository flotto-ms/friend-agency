import type { SaveQuestsRequest } from "@flotto/types";

const base = "https://hls6ldikcd.execute-api.us-east-1.amazonaws.com/prod";

let lastValue = 100;
let timeout = Date.now();

const MINS_30 = 1_800_000;
const MAX_QUESTS = 100;

export const FlottoApi = {
  postQuests: async (userId: number, quests: SaveQuestsRequest) => {
    const changes = await getChanges(quests);

    if (changes.received!.length == 0 && changes.sent!.length == 0) {
      return;
    }

    const url = `${base}/users/${userId}/quests`;

    return fetch(url, { method: "POST", body: JSON.stringify(changes) })
      .then((r) => r.json())
      .catch((ex) => console.error(ex));
  },
  postSlots: async (userId: number, slots: number) => {
    if (Date.now() < timeout && lastValue === slots) {
      return;
    }

    lastValue = slots;
    timeout = Date.now() + MINS_30;
    const url = `${base}/users/${userId}/slots`;

    return fetch(url, { method: "POST", body: JSON.stringify({ slots }) })
      .then((r) => r.json())
      .catch((ex) => console.error(ex));
  },
};

const getChanges = async (quests: SaveQuestsRequest) => {
  const changes: SaveQuestsRequest = { received: [], sent: [] };

  const store = await chrome.storage.local
    .get(["quests"])
    .then((result) => (result.quests ?? { received: [], sent: [] }) as SaveQuestsRequest);
  let changeCount = 0;

  quests.received?.forEach((quest) => {
    const prev = store.received?.find((item) => item.id === quest.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(quest)) {
      if (changeCount < MAX_QUESTS) {
        changeCount++;
        changes.received?.push(quest);
      }
    }
  });

  quests.sent?.forEach((quest) => {
    const prev = store.sent?.find((item) => item.id === quest.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(quest)) {
      if (changeCount < MAX_QUESTS) {
        changeCount++;
        changes.sent?.push(quest);
      }
    }
  });

  const newStore = structuredClone(store);
  newStore.received = newStore.received?.filter((item) => !changes.received?.find((change) => change.id === item.id));
  newStore.sent = newStore.sent?.filter((item) => !changes.sent?.find((change) => change.id === item.id));

  changes.received?.forEach((item) => newStore.received?.push(item));
  changes.sent?.forEach((item) => newStore.sent?.push(item));

  await chrome.storage.local.set({ quests: newStore });

  return changes;
};

//chrome.storage.local.set({ quests: { received: [], sent: [] } });
