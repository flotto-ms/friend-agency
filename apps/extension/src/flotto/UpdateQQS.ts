type Payload = {
  pID: number;
  QQS: number;
};

let lastValue = 100;
let timeout = Date.now();

const MINS_30 = 1_800_000;

export const updateQqs = (payload: Payload) => {
  if (Date.now() < timeout && lastValue === payload.QQS) {
    return;
  }

  lastValue = payload.QQS;
  timeout = Date.now() + MINS_30;

  fetch(
    "https://script.google.com/macros/s/AKfycbxtrIVNsiKrttYjvTpn5QhULI1cDiEkof8maaLCr1X_Wn4OwaFc5vg7W2sjM0l-tHcN/exec",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  ).catch(console.error);
};
