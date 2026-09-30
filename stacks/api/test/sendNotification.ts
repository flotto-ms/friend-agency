import { UserTableItem } from "@flotto/types";
import { getItems } from "../src/utils/DynamoDbUtils";
import ChatConnection from "../src/utils/mso/ChatConnection";

process.env.AWS_PROFILE = "flotto";
process.env.CONFIG_BUCKET = "apistack-configbucket2112c5ec-oajyjtyjf69n";
process.env.USER_TABLE = "ApiStack-UserTableBD4BF69E-1SUSR44YNTRHF";

const message = `Hi friends!  Flotto's Friend Quest season 8 is right around the corner, and you were part of the big team with us at some point in the last year.  We wanted to reach out and ask if you'd be interested in participating again.  We have a number of great improvements for this season, including a brand-new website that will make finding buyers and sending quests even easier, and allow us to make a final tally after the season in minutes rather than days or weeks.  Feel free to ask questions, and if you'd like to join - in any role - please submit an application!
https://tinyurl.com/fqa-s8-app
`; // `Your Flotto one time password is: ${otpCode}`;

const members = [123456789];
const blacklist: number[] = [];

const sendTo = members.filter((id) => !blacklist.includes(id));
console.log(sendTo.length);

ChatConnection.createConnection("notices")
  .then(async (server) => {
    for (let userId of sendTo) {
      await server
        .sendMessage(userId, message)
        .then((r) => console.log(userId) + ",")
        .catch((ex) => console.error(userId, ex.message));
      await new Promise((a) => setTimeout(a, 1_000));
    }

    console.log("close");
    server.close();
  })
  .catch((ex) => {
    console.error(ex);
  });
