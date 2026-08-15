import { UserTableItem } from "@flotto/types";
import IdUtils from "../../../utils/IdUtils";
import { createClient } from "../../../utils/DynamoDbUtils";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const createGroup = async (user: UserTableItem, label: string, rates: string[] = []) => {
  const validRates = rates.filter((id) => Boolean(user.rates?.[id]));
  const groupId = IdUtils.createId();

  let updateExpression = "";

  const attributeNames: Record<string, string> = { "#groups": "groups" };
  const attributeValues: Record<string, any> = {};

  if (user.groups) {
    attributeNames["#groupId"] = groupId;
    attributeValues[":group"] = { label };
    updateExpression = "SET #groups.#groupId = :group";
  } else {
    attributeValues[":groups"] = { [groupId]: { label } };
    updateExpression = "SET #groups = :groups";
  }

  if (validRates.length > 0) {
    attributeNames["#rates"] = "rates";
    attributeValues[":groupId"] = new Set([groupId]);

    validRates.forEach((id, i) => {
      const key = `#key${i}`;
      attributeNames[key] = id;
      updateExpression += `${i === 0 ? " ADD" : ","} #rates.${key}.#groups :groupId`;
    });
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
    body: JSON.stringify({ id: groupId, label }),
  };
};
