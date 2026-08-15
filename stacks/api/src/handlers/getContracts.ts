import { APIGatewayProxyEvent } from "aws-lambda";
import ContractTable from "../utils/ContractTable";
import { ContractTableItem } from "@flotto/types";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;
  let output: Partial<ContractTableItem>[] = [];

  if (id) {
    output = await ContractTable.getContractHistory(id).then((r) =>
      r.map((c) => {
        const { key, userId, rateId, ...rest } = c;
        return { ...rest };
      }),
    );
  } else {
    output = await ContractTable.getActiveContracts().then((r) =>
      r.map((c) => {
        const { key, rateId, endedAt, ...rest } = c;
        return { id: key, ...rest };
      }),
    );
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contracts: output }),
  };
};
