import { Rate, UserTableItem } from "@flotto/types";
import IdUtils from "../../../utils/IdUtils";
import { createClient } from "../../../utils/DynamoDbUtils";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import ContractTable from "../../../utils/tables/ContractTable";

export const createRate = async (user: UserTableItem, rate: Rate) => {
  const rateId = IdUtils.createId();

  const attributeNames: Record<string, string> = { "#rates": "rates" };
  const attributeValues: Record<string, any> = {};

  const obj = {
    ...rate,
    groups: rate.groups ? [...new Set(rate.groups)] : undefined,
  };

  if (!rate.groups || rate.groups.length === 0) {
    delete obj.groups;
  }

  if (user.rates) {
    attributeNames["#rateId"] = rateId;
    attributeValues[":rate"] = obj;
  } else {
    attributeValues[":rates"] = { [rateId]: obj };
    const command = new UpdateCommand({
      TableName: process.env.USER_TABLE!,
      Key: { id: user.id },
      UpdateExpression: "SET #rates = :rates",
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
    });

    console.debug(command.input);
    await createClient().send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ id: rateId, ...obj }),
    };
  }

  const command = new UpdateCommand({
    TableName: process.env.USER_TABLE!,
    Key: { id: user.id },
    UpdateExpression: "SET #rates.#rateId = :rate",
    ExpressionAttributeNames: attributeNames,
    ExpressionAttributeValues: attributeValues,
  });

  console.debug(command.input);
  await createClient().send(command);

  if (obj.enabled) {
    await ContractTable.startContract({
      userId: user.id,
      rateId,
      type: obj.type,
      price: obj.amount,
      filter: obj.filter,
      startedAt: new Date().toISOString(),
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ id: rateId, ...obj }),
  };
};
