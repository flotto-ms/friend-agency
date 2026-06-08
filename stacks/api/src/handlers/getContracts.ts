import ContractTable from "../utils/ContractTable";

export const handler = async () => {
  const contracts = (await ContractTable.getActiveContracts()).map((c) => {
    const { key, rateId, startedAt, endedAt, ...rest } = c;
    return rest;
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contracts }),
  };
};
