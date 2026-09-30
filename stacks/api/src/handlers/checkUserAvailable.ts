import { ScheduledHandler } from "aws-lambda";
import UserTable from "../utils/tables/UserTable";
import MainConnection from "../utils/mso/MainConnection";
import { UserTableItem } from "@flotto/types";

const RATE_LIMIT_TIMEOUT = 100;
const USER_LOAD_INTERVAL = 600_000; // 10 mins;
const VALID_MONTHS = [1, 5, 9];

type CacheItem = {
  allowFriendQuests: boolean;
  isFull: boolean;
};

let lastUserLoad = 0;
let users: UserTableItem[] = [];
const cache: Record<string, CacheItem> = {};

export const handler: ScheduledHandler = async () => {
  const month = new Date().getUTCMonth();

  if (!VALID_MONTHS.includes(month)) {
    console.log(`${month} is not a valid month`);
    return;
  }

  if (lastUserLoad < Date.now() - USER_LOAD_INTERVAL) {
    users = await UserTable.getUsers("contractor");
    lastUserLoad = Date.now();
  }

  if (users.length > 0) {
    await MainConnection.createConnection("bot").then(async (connection) => {
      for (const user of users) {
        let success = false;
        let attempts = 0;
        do {
          success = await processUser(connection, user);
          attempts++;
        } while (!success && attempts < 4);
      }
      connection.close();
    });
  }
};

const processUser = async (
  connection: Awaited<ReturnType<typeof MainConnection.createConnection>>,
  user: UserTableItem,
) => {
  return connection
    .getSendFriendQuestData(user.id)
    .then(async (result) => {
      const key = user.id.toString();
      const current: CacheItem = {
        allowFriendQuests: result.friendData?.allowFriendQuests ?? true,
        isFull: result.isFull ?? false,
      };

      const old = cache[key];
      cache[key] = current;

      if (!old || old.allowFriendQuests !== current.allowFriendQuests || old.isFull !== current.isFull) {
        console.log(`${result.friendData.username} Changed`, current);
        await UserTable.updateQqs(user.id, current.allowFriendQuests, current.isFull);
      }

      return true;
    })
    .catch(async (e: Error) => {
      console.error(`${user.username} Error`, e.message);
      if (e.message === "TooManyRequestsEvent") {
        await delay(RATE_LIMIT_TIMEOUT);
        return false;
      } else {
        return true;
      }
    });
};

const delay = async (amount: number) => {
  return new Promise((r) => setTimeout(r, amount));
};
