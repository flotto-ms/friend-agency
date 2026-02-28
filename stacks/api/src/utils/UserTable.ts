import { Rate, UserTableItem } from "@flotto/types";
import { createClient, getItem } from "./DynamoDbUtils";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const getUser = (id: number) => {
  return getItem<UserTableItem>({
    TableName: process.env.USER_TABLE!,
    Key: { id: id },
  });
};

const updateRates = async (userId: number, rates: Rate[]) => {
  const attributeKeys: Record<string, string> = {};
  const attributeValues: Record<string, any> = {};

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
    ReturnValues: "ALL_OLD",
  });

  console.debug(command.input);

  return createClient().send(command);
};

export default {
  getUser,
  updateRates,
};
