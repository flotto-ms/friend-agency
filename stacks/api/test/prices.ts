import { ReceivedQuestTableItem, SentQuestTableItem } from "@flotto/types";
import QuestUtility from "../src/utils/QuestUtility";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { createClient, updateItem } from "../src/utils/DynamoDbUtils";

process.env.AWS_PROFILE = "flotto";
process.env.USER_TABLE = "ApiStack-UserTableBD4BF69E-1SUSR44YNTRHF";
process.env.RECEIVED_QUESTS_TABLE = "ApiStack-ReceivedQuestsTableA96F3BA7-J7KJK31JX5C1";
process.env.SENT_QUESTS_TABLE = "ApiStack-SentQuestsTable566DE4ED-P37HO94RNSKD";
process.env.CONTRACT_TABLE = "Contracts";

const go = async () => {
  let key;

  do {
    createClient()
      .send(
        new ScanCommand({
          TableName: process.env.SENT_QUESTS_TABLE!,
          ExclusiveStartKey: key,
        }),
      )
      .then((r) => {
        key = r.LastEvaluatedKey;
        const tasks = (r.Items as SentQuestTableItem[])
          ?.filter((item) => !item.flotto)
          .map((item) => {
            return QuestUtility.getFlottoDetails(item).then((details) => {
              return updateItem<SentQuestTableItem>({
                TableName: process.env.SENT_QUESTS_TABLE!,
                Key: { userId: item.userId, id: item.id },
                Attrs: { flotto: details },
              });
            });
          });

        return Promise.all(tasks);
      });
  } while (key);
};
go();
