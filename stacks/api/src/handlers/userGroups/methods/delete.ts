import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UserTableItem } from "@flotto/types";
import { createClient } from "../../../utils/DynamoDbUtils";

export const deleteGroup = async (user: UserTableItem, groupId: string) => {
  if (!user.groups?.[groupId]) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Group does not exist" }),
    };
  }

  const validRates = Object.entries(user.rates ?? {})
    .filter(([_, rate]) => rate.groups?.includes(groupId) ?? false)
    .map(([id]) => id);

  const attributeNames: Record<string, string> = {
    "#groups": "groups",
    "#groupId": groupId,
  };
  const attributeValues: Record<string, any> = {};
  let updateExpression = "REMOVE #groups.#groupId";

  if (validRates.length > 0) {
    attributeNames["#rates"] = "rates";
    attributeValues[":groupId"] = new Set([groupId]);

    validRates.forEach((id, i) => {
      const key = `#key${i}`;
      attributeNames[key] = id;
      updateExpression += `${i === 0 ? " DELETE" : ","} #rates.${key}.#groups :groupId`;
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
    body: JSON.stringify({ id: groupId }),
  };
};
