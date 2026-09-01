import SendMessage from "../src/utils/mso/SendMessage";

process.env.AWS_PROFILE = "flotto";
process.env.CONFIG_BUCKET = "apistack-configbucket2112c5ec-oajyjtyjf69n";

const build = 1000;

const userId = 11698196;
const otpCode = "112-331";
const message = `Your Flotto one time password is: ${otpCode}`;
SendMessage.sendMessage(userId, message, build).then(() => {
  console.log("Message Sent");
});
