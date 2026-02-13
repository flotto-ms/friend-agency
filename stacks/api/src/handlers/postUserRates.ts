import type { APIGatewayProxyEvent } from "aws-lambda";
import type { ContractTableItem, Rate, SaveRatesRequest } from "@flotto/types";
import { createClient } from "../utils/DynamoDbUtils";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getRateQuestId } from "../utils/FlottoQuestType";
import ContractsTable from "../utils/ContractsTable";

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

  const attributeKeys: Record<string, string> = {};
  const attributeValues: Record<string, any> = {};

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

  const rateExpression = rates
    .map((rate, i) => {
      const key = `#key${i}`;
      const val = `:val${i}`;
      attributeKeys[key] = `quest_${rate.type}`;
      attributeValues[val] = rate;
      return `, #rate.${key} = ${val}`;
    })
    .join("");

  attributeKeys["#rate"] = "rates";
  attributeKeys["#contractor"] = "contractor";
  attributeValues[":contractor"] = true;

  await createClient()
    .send(
      new UpdateCommand({
        TableName: process.env.USER_TABLE!,
        Key: { id: userId },
        UpdateExpression: "SET #rate = :rate",
        ConditionExpression: "attribute_exists(id) AND attribute_not_exists(#rate)",
        ExpressionAttributeNames: { "#rate": "rates" },
        ExpressionAttributeValues: { ":rate": {} },
      }),
    )
    .catch(() => console.debug("Rates alread exists"));

  const command = new UpdateCommand({
    TableName: process.env.USER_TABLE!,
    Key: { id: userId },
    UpdateExpression: "SET #contractor = :contractor" + rateExpression,
    ConditionExpression: "attribute_exists(id)",
    ExpressionAttributeNames: attributeKeys,
    ExpressionAttributeValues: attributeValues,
    ReturnValues: "ALL_NEW",
  });

  console.debug(command.input);

  const result = await createClient().send(command);

  if (result.Attributes?.available) {
    await Promise.all(rates.map((rate) => verifyContracts(userId, rate)));
  }

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

    const contract: ContractTableItem = {
      userId,
      type: rate.type,
      price: rate.amount,
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

  if (contract.price === rate.amount && rate.enabled) {
    return true;
  }

  await ContractsTable.endContract(contract);

  return false;
};
