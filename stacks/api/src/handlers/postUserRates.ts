import type { APIGatewayProxyEvent } from "aws-lambda";
import type { ContractsTableItem, Rate, SaveRatesRequest, UserTableItem } from "@flotto/types";
import RateUtils from "../utils/RateUtils";
import { getRateQuestId } from "../utils/FlottoQuestType";
import ContractsTable from "../utils/ContractsTable";
import UserTable from "../utils/UserTable";
import { MinContractRates } from "../data/MinContractRates";

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

  const rates = data.rates
    .map(
      (rate) =>
        ({
          type: getRateQuestId(rate.name),
          amount: rate.amount,
          enabled: rate.enabled,
        }) as Rate,
    )
    .filter((rate) => Boolean(rate.type));

  if (rates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid Rate Name" }),
    };
  }

  const result = await UserTable.updateRates(userId, rates);

  const tasks: Promise<any>[] = [];

  tasks.push(...rates.map((rate) => RateUtils.logRateAction(result.Attributes as UserTableItem, rate)));

  if (result.Attributes?.available) {
    tasks.push(...rates.map((rate) => verifyContracts(userId, rate)));
  }

  await Promise.all(tasks);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Success" }),
  };
};

const verifyContracts = async (userId: number, rate: Rate) => {
  await endContracts(userId, rate).then((contractRunning) => {
    if (!rate.enabled || contractRunning) {
      return;
    }

    const contract: ContractsTableItem = {
      userId,
      type: rate.type,
      price: getRateAmount(rate),
      startedAt: new Date().toISOString(),
    };

    return ContractsTable.startContract(contract);
  });
};

const endContracts = async (userId: number, rate: Rate) => {
  const activeContracts = await ContractsTable.getActiveUserContracts(userId, rate.type);
  if (activeContracts.length == 0) {
    return false;
  }
  const contract = activeContracts[0];

  if (contract.price === getRateAmount(rate) && rate.enabled) {
    return true;
  }

  await ContractsTable.endContract(contract);

  return false;
};

const getRateAmount = (rate: Rate) => {
  const minAmount = MinContractRates[rate.type];
  return rate.amount < minAmount ? minAmount : rate.amount;
};
