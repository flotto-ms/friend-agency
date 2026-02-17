import type { APIGatewayProxyEvent } from "aws-lambda";
import { getItem, updateItem } from "../utils/DynamoDbUtils";
import { SaveAvailabilityRequest, UserTableItem } from "@flotto/types";
import ContractsTable from "../utils/ContractsTable";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  const data = JSON.parse(event.body ?? "{}") as SaveAvailabilityRequest;
  const userId = parseInt(id);

  const user = await getItem<UserTableItem>({
    Key: { id: userId },
    TableName: process.env.USER_TABLE!,
  });

  if (!user) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "User not found" }),
    };
  }

  if (user.available === data.available) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Success" }),
    };
  }

  await updateItem<UserTableItem>({
    Key: { id: userId },
    TableName: process.env.USER_TABLE!,
    Attrs: {
      available: data.available,
    },
    Upsert: true,
  });

  if (!data.available) {
    //End Current Contracts
    await ContractsTable.getActiveUserContracts(userId).then((contracts) => {
      return Promise.all(contracts.map((contract) => ContractsTable.endContract(contract)));
    });
  } else if (user.rates) {
    //Create Contracts for enabled rates
    const enabledRates = Object.values(user.rates).filter((rate) => rate.enabled);
    await Promise.all(
      enabledRates.map((rate) => {
        return ContractsTable.startContract({
          userId,
          type: rate.type,
          price: rate.amount,
          startedAt: new Date().toISOString(),
        });
      }),
    );
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Success" }),
  };
};
