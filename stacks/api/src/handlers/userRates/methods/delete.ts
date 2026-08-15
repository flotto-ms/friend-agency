import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UserTableItem } from "@flotto/types";
import { createClient } from "../../../utils/DynamoDbUtils";

export const deleteRate = async (user: UserTableItem, rateId: string) => {
  if (!user.rates?.[rateId]) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Rate does not exist" }),
    };
  }

  const attributeNames: Record<string, string> = {
    "#rates": "rates",
    "#rateId": rateId,
  };
  let updateExpression = "REMOVE #rates.#rateId";

  const command = new UpdateCommand({
    TableName: process.env.USER_TABLE!,
    Key: { id: user.id },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: attributeNames,
  });

  console.debug(command.input);
  await createClient().send(command);

  return {
    statusCode: 204,
  };
};
