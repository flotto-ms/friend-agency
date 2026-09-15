import { UserTableItem } from "@flotto/types";
import DynamoDbUtils from "../src/utils/DynamoDbUtils";
import ContractTable from "../src/utils/tables/ContractTable";

process.env.AWS_PROFILE = "flotto";
process.env.CONTRACT_TABLE = "Contract";
process.env.CONFIG_BUCKET = "apistack-configbucket2112c5ec-oajyjtyjf69n";
process.env.USER_TABLE = "ApiStack-UserTableBD4BF69E-1SUSR44YNTRHF";

DynamoDbUtils.getItems<UserTableItem>({ TableName: process.env.USER_TABLE })
  .then((r) => {
    return Promise.all(
      r.map((u) => {
        return DynamoDbUtils.updateItem<UserTableItem>({
          Key: { id: u.id },
          TableName: process.env.USER_TABLE!,
          Attrs: {
            rates: null,
            contractor: null,
          },
          Upsert: false,
        });
      }),
    );
  })
  .then(() => console.log("Users Reset"));

ContractTable.getActiveContracts()
  .then((r) => {
    return Promise.all(r.map((c) => ContractTable.endContract(c)));
  })
  .then((r) => console.log("Contracts Ended"));
