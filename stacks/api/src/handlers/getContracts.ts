import { APIGatewayProxyEvent } from "aws-lambda";
import ContractTable from "../utils/ContractTable";
import { ContractTableItem } from "@flotto/types";
import ResponseUtils from "../utils/ResponseUtils";

const activeContractMapping = (r: ContractTableItem[]) =>
  r.map((c) => {
    const { key, rateId, endedAt, ...rest } = c;
    return { id: key, ...rest };
  });

const contractHistoryMapping = (r: ContractTableItem[]) =>
  r.map((c) => {
    const { key, userId, rateId, ...rest } = c;
    return { ...rest };
  });

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;
  let output: Partial<ContractTableItem>[] = [];
  if (id && event.path.includes("/users/")) {
    if (!Number.isFinite(id)) {
      return ResponseUtils.notFound("Unknown User");
    }
    output = await ContractTable.getActiveUserContracts(parseInt(id)).then(activeContractMapping);
  } else if (id) {
    output = await ContractTable.getContractHistory(id).then(contractHistoryMapping);
  } else {
    output = await ContractTable.getActiveContracts().then(activeContractMapping);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contracts: output }),
  };
};
