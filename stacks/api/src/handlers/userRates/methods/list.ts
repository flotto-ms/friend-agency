import { UserTableItem } from "@flotto/types";

export const listRates = async (user: UserTableItem) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ rates: Object.entries(user.rates ?? {}).map(([id, rate]) => ({ id, ...rate })) }),
  };
};
