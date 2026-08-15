import { Rate, UserTableItem } from "@flotto/types";
import IdUtils from "../../../utils/IdUtils";
import { createClient } from "../../../utils/DynamoDbUtils";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const createRate = async (user: UserTableItem, rate: Rate) => {
  const rateId = IdUtils.createId();

  let updateExpression = "";

  const attributeNames: Record<string, string> = { "#rates": "rates" };
  const attributeValues: Record<string, any> = {};

  const obj = {
    ...rate,
    groups: rate.groups ? new Set(rate.groups) : undefined,
  };

  if (!rate.groups || rate.groups.length === 0) {
    delete obj.groups;
  }

  if (user.rates) {
    attributeNames["#groupId"] = rateId;
    attributeValues[":rate"] = obj;
    updateExpression = "SET #rates.#rateId = :rate";
  } else {
    attributeValues[":rates"] = { [rateId]: obj };
    updateExpression = "SET #rates = :rates";
  }

  const command = new UpdateCommand({
    TableName: process.env.USER_TABLE!,
    Key: { id: user.id },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: attributeNames,
    ExpressionAttributeValues: attributeValues,
  });

  console.debug(command.input);
  await createClient().send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({ id: rateId, ...rate }),
  };
};
