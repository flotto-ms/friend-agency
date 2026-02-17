import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { createClient, updateItem } from "../src/utils/DynamoDbUtils";

process.env.AWS_PROFILE = "flotto";

const go = async () => {
  let key;

  do {
    const command = new ScanCommand({
      TableName: "Contracts",
      ExclusiveStartKey: key,
    });

    console.debug(command.input);
    await createClient()
      .send(command)
      .then(async (r) => {
        if (r.Items) {
          for (let item of r.Items) {
            if (!item.userId_type) {
              await updateItem({
                TableName: "Contracts",
                Key: {
                  type: item.type,
                  startedAt: item.startedAt,
                },
                Attrs: {
                  userId_type: `${item.userId}_${item.type}`,
                },
              });
            }
          }
        }
        return r.LastEvaluatedKey;
      });
  } while (key);
};

go();
