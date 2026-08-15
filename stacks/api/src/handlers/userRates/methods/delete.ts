import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UserTableItem } from "@flotto/types";
import { createClient } from "../../../utils/DynamoDbUtils";
import ContractTable from "../../../utils/ContractTable";
import ResponseUtils from "../../../utils/ResponseUtils";

export const deleteRate = async (user: UserTableItem, rateId: string) => {
  const current = user.rates?.[rateId];
  if (!current) {
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

  const activeContracts = await ContractTable.getActiveUserContracts(user.id, rateId);
  if (activeContracts.length > 0) {
    await Promise.all(activeContracts.map((contract) => ContractTable.endContract(contract)));
  }

  return ResponseUtils.noContent("Rate Deleted");
};
