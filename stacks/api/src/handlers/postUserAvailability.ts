import type { APIGatewayProxyEvent } from "aws-lambda";
import { getItem, updateItem } from "../utils/DynamoDbUtils";
import { SaveAvailabilityRequest, UserTableItem } from "@flotto/types";
import ContractActionTable from "../utils/tables/ContractActionTable";
import ContractTable from "../utils/tables/ContractTable";

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

  if (user?.available === data.available) {
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

  await ContractActionTable.logPause(userId, !data.available);

  if (!data.available) {
    //End Current Contracts
    await ContractTable.getActiveUserContracts(userId).then((contracts) => {
      return Promise.all(contracts.map((contract) => ContractTable.endContract(contract)));
    });
  } else if (user?.rates) {
    //Create Contracts for enabled rates
    const enabledRates = Object.entries(user.rates).filter(([id, rate]) => rate.enabled);
    await Promise.all(
      enabledRates.map(([id, rate]) => {
        return ContractTable.startContract({
          userId,
          rateId: id,
          type: rate.type,
          price: rate.amount,
          filter: rate.filter,
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
