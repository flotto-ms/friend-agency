import { NullOptional, Rate, UserTableItem } from "@flotto/types";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { createClient } from "../../../utils/DynamoDbUtils";
import ResponseUtils from "../../../utils/ResponseUtils";
import ContractTable from "../../../utils/ContractTable";

export const updateRate = async (
  user: UserTableItem,
  rateId: string,
  changes: Partial<NullOptional<Omit<Rate, "type">>>,
) => {
  const current = user.rates?.[rateId];
  if (!current) {
    return ResponseUtils.notFound("Rate not found");
  }

  const next: Rate = {
    ...current,
    ...(changes.amount !== undefined ? { amount: changes.amount } : {}),
    ...(typeof changes.enabled === "boolean" ? { enabled: changes.enabled } : {}),
  };

  const contractStateChanged =
    current.enabled !== next.enabled ||
    current.amount !== next.amount ||
    JSON.stringify(current.filter ?? null) !== JSON.stringify(next.filter ?? null);

  if (changes.filter == null) {
    delete next.filter;
  } else if (changes.filter && Object.keys(changes.filter).length === 0) {
    delete next.filter;
  } else if (changes.filter) {
    next.filter = changes.filter;
  }

  if (changes.groups === null || (changes.groups && changes.groups.length === 0)) {
    delete next.groups;
  } else if (changes.groups) {
    next.groups = [...new Set(changes.groups)];
  }

  const command = new UpdateCommand({
    TableName: process.env.USER_TABLE!,
    Key: { id: user.id },
    UpdateExpression: "SET #rates.#rateId = :rate",
    ExpressionAttributeNames: {
      "#rates": "rates",
      "#rateId": rateId,
    },
    ExpressionAttributeValues: {
      ":rate": next,
    },
  });

  await createClient().send(command);

  if (contractStateChanged) {
    const activeContracts = await ContractTable.getActiveUserContracts(user.id, rateId);
    await Promise.all(activeContracts.map((contract) => ContractTable.endContract(contract)));
  }

  if (next.enabled && contractStateChanged) {
    await ContractTable.startContract({
      userId: user.id,
      rateId,
      type: next.type,
      price: next.amount,
      filter: next.filter,
      startedAt: new Date().toISOString(),
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ id: rateId, ...next }),
  };
};
