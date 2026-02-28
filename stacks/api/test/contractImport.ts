import { ContractActions } from "./data/ContractActions";
import { getActions, getLiveActions } from "./import/combineActions";
import { processActions } from "./import/processActions";

import { writeFile } from "node:fs/promises";

process.env.AWS_PROFILE = "flotto";
process.env.CONTRACT_TABLE = "Contract";
process.env.CONTRACT_ACTION_TABLE = "ContractAction";
/*
getLiveActions().then((r) => {
  let json = JSON.stringify(r);
  return writeFile("myjsonfile.json", json);
});

getActions(false).then((actions) => {
  const { users, contracts } = processActions(actions);
  console.log(JSON.stringify(contracts, null, 2));
});
*/

const resets = ContractActions.filter((action) => action.action === "Price" && action.price === 0);
const unsubs = resets.filter((action) => {
  const d = new Date(action.timestamp).getTime();

  const sub = ContractActions.find((c) => {
    if (c.userId !== action.userId || c.type !== action.type || c.action !== "Subscription") {
      return false;
    }

    const compare = new Date(c.timestamp).getTime();

    return d - 500 < compare && compare < d + 500;
  });

  if (sub) {
    console.log(sub);
  }
  return !!sub;
});

console.log(resets.length, unsubs.length);
