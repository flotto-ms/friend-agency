import type { APIGatewayProxyEvent } from "aws-lambda";
import type { ContractTableItem, Rate, SaveRatesRequest } from "@flotto/types";
import { getRateFilter, getRateQuestId } from "../utils/FlottoQuestType";
import UserTable from "../utils/UserTable";
import ContractActionTable from "../utils/ContractActionTable";
import ContractTable from "../utils/ContractTable";

export const handler = async (event: APIGatewayProxyEvent) => {
  const userParam = event.pathParameters?.id;

  if (!userParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  const userId = parseInt(userParam);
  const data: SaveRatesRequest = JSON.parse(event.body ?? "{}");

  console.debug(data);

  await Promise.all(data.rates.map((rate) => ContractActionTable.logRate(userId, rate)));

  const rates = data.rates
    .map(
      (rate) =>
        [
          `quest_${rate.name.replaceAll(" ", "_").toLowerCase()}`,
          {
            type: getRateQuestId(rate.name),
            amount: rate.amount,
            enabled: rate.enabled,
            filter: getRateFilter(rate.name),
          },
        ] as [string, Rate],
    )
    .filter((rate) => {
      const valid = Boolean(rate[1].type);
      if (!valid) {
        console.log("Invalid Rate:", rate);
      }
      return valid;
    });

  if (rates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid Rate Name" }),
    };
  }

  const result = await UserTable.updateRates(userId, rates);

  const tasks: Promise<any>[] = [];

  if (result.Attributes?.available) {
    tasks.push(...rates.map((rate) => verifyContracts(userId, rate[0], rate[1])));
  }

  await Promise.all(tasks);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Success" }),
  };
};

const verifyContracts = async (userId: number, rateId: string, rate: Rate) => {
  await endContracts(userId, rateId, rate).then((contractRunning) => {
    if (!rate.enabled || contractRunning) {
      return;
    }

    const contract: Omit<ContractTableItem, "key" | "endedAt"> = {
      userId,
      rateId,
      type: rate.type,
      price: rate.amount,
      filter: rate.filter,
      startedAt: new Date().toISOString(),
    };

    return ContractTable.startContract(contract);
  });
};

const endContracts = async (userId: number, rateId: string, rate: Rate) => {
  const activeContracts = await ContractTable.getActiveUserContracts(userId, rateId);

  console.log(activeContracts);

  if (activeContracts.length == 0) {
    console.log("No Active Contract");
    return false;
  }
  const contract = activeContracts[0];

  if (contract.price === rate.amount && rate.enabled) {
    console.log("No change to Contract");
    return true;
  }

  console.log("End Contract");
  await Promise.all(activeContracts.map((contract) => ContractTable.endContract(contract)));

  return false;
};
