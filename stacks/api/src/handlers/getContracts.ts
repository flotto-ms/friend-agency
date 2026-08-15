import { APIGatewayProxyEvent } from "aws-lambda";
import ContractTable from "../utils/ContractTable";
import { ContractTableItem } from "@flotto/types";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;
  let contracts: ContractTableItem[] = [];

  if (id) {
    contracts = await ContractTable.getActiveUserContracts(parseInt(id));
  } else {
    contracts = await ContractTable.getActiveContracts();
  }

  const output = contracts.map((c) => {
    const { key, rateId, startedAt, endedAt, ...rest } = c;
    return { id: key, ...rest };
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contracts: output }),
  };
};
