import jwt from "jsonwebtoken";
import TokenUtils from "./TokenUtils";

const verify = async (token: string) => {
  return TokenUtils.getSecret().then((secret) => jwt.verify(token, secret));
};

const create = async (userId: number, isAdmin: boolean = false) => {
  return TokenUtils.getSecret().then((secret) =>
    jwt.sign(
      {
        sub: userId,
        admin: isAdmin,
        iss: "https://flotto.vercel.app",
      },
      secret,
      { expiresIn: "180 days" },
    ),
  );
};

export default {
  verify,
  create,
};
